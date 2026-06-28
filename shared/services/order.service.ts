import { Cart } from "../models/Cart.model";
import { CartItem } from "../models/CartItem.model";
import type { IDiscount } from "../models/Discount.model";
import { Order, type IOrder } from "../models/Order.model";
import { OrderItem } from "../models/OrderItem.model";
import { Payment } from "../models/Payment.model";
import { Product } from "../models/Product.model";
import { User } from "../models/User.model";
import { CURRENCY_CODE } from "../lib/format";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors";
import { buildPaginatedResult, getSkip } from "../lib/pagination";
import { getPaymentProvider } from "../providers/payment";
import type { AddressInput } from "../schemas/order.schema";
import type { Actor } from "../types/actor";
import type { OrderStatus } from "../types/enums";
import { writeAuditLog } from "./audit.service";
import { computeCartTotals } from "./cart.service";
import { computeDiscountedPrice } from "./discount.service";
import { createNotification } from "./notification.service";
import { decrementStock } from "./product.service";

interface PopulatedCheckoutItem {
  quantity: number;
  product: {
    _id: { toString(): string };
    name: string;
    price: number;
    seller: { toString(): string };
    discount: IDiscount | null;
  };
}

function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
}

export async function createOrderFromCart(
  actor: Actor,
  shippingAddress: AddressInput
): Promise<IOrder> {
  if (actor.role !== "CUSTOMER") throw new ForbiddenError("Only customers can place orders");

  const customer = await User.findById(actor.id);
  if (!customer) throw new NotFoundError("Customer not found");

  const cart = await Cart.findOne({ customer: actor.id });
  if (!cart || cart.items.length === 0) throw new ValidationError("Your cart is empty");

  const items = (await CartItem.find({ cart: cart._id }).populate({
    path: "product",
    select: "name price seller discount stock isActive",
    populate: "discount",
  })) as unknown as PopulatedCheckoutItem[];

  for (const item of items) {
    const product = await Product.findById(item.product._id);
    if (!product || !product.isActive || product.stock < item.quantity) {
      throw new ValidationError(`"${item.product.name}" no longer has enough stock`);
    }
  }

  const totals = await computeCartTotals(actor);

  const order = await Order.create({
    customer: actor.id,
    orderNumber: generateOrderNumber(),
    items: [],
    shippingAddress,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    shippingFee: totals.shippingFee,
    total: totals.total,
    status: "PENDING",
  });

  const orderItems = await OrderItem.insertMany(
    items.map((item) => {
      const discountedPrice = computeDiscountedPrice(item.product.price, item.product.discount);
      return {
        order: order._id,
        product: item.product._id,
        seller: item.product.seller,
        nameSnapshot: item.product.name,
        priceSnapshot: discountedPrice,
        quantity: item.quantity,
        discountAppliedSnapshot: item.product.price - discountedPrice,
      };
    })
  );

  order.items = orderItems.map((i) => i._id);
  await order.save();

  const paymentProvider = getPaymentProvider();
  const { providerReference } = await paymentProvider.initiate({
    orderId: order._id.toString(),
    amount: totals.total,
    currency: CURRENCY_CODE,
    customerEmail: customer.email,
  });
  const verification = await paymentProvider.verify(providerReference);

  const payment = await Payment.create({
    order: order._id,
    provider: "DUMMY",
    providerReference,
    amount: totals.total,
    status: verification.status,
    paidAt: verification.status === "SUCCEEDED" ? new Date() : null,
    rawResponse: verification.rawResponse,
  });

  order.payment = payment._id;
  order.status = verification.status === "SUCCEEDED" ? "PAID" : "PENDING";
  await order.save();

  if (verification.status === "SUCCEEDED") {
    for (const item of items) {
      await decrementStock(item.product._id.toString(), item.quantity);
    }

    const sellerIds = new Set(items.map((item) => item.product.seller.toString()));
    for (const sellerId of sellerIds) {
      await createNotification({
        user: sellerId,
        type: "ORDER_PLACED",
        title: "New order received",
        message: `You have a new order (#${order.orderNumber}).`,
        link: "/seller/orders",
      });
    }

    await createNotification({
      user: actor.id,
      type: "ORDER_PLACED",
      title: "Order placed",
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      link: `/orders/${order._id.toString()}`,
    });

    await CartItem.deleteMany({ cart: cart._id });
    cart.items = [];
    await cart.save();
  }

  return order;
}

export async function getOrderHistory(actor: Actor, params: { page: number; limit: number }) {
  const filter = { customer: actor.id };
  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate({ path: "items", populate: "product" })
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    Order.countDocuments(filter),
  ]);
  return buildPaginatedResult(items, total, params.page, params.limit);
}

export async function getOrderById(actor: Actor, orderId: string) {
  const order = await Order.findById(orderId).populate({
    path: "items",
    populate: "product",
  });
  if (!order) throw new NotFoundError("Order not found");

  if (actor.role === "ADMIN") return order;
  if (actor.role === "CUSTOMER" && order.customer.toString() === actor.id) return order;

  if (actor.role === "SELLER") {
    const ownsItem = await OrderItem.exists({ order: order._id, seller: actor.id });
    if (ownsItem) return order;
  }

  throw new ForbiddenError("You do not have permission to view this order");
}

export async function listOrdersForAdmin(params: {
  page: number;
  limit: number;
  status?: OrderStatus;
}) {
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;

  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate("customer")
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    Order.countDocuments(filter),
  ]);
  return buildPaginatedResult(items, total, params.page, params.limit);
}

export async function listOrderItemsForSeller(
  actor: Actor,
  params: { page: number; limit: number }
) {
  if (actor.role !== "SELLER") throw new ForbiddenError();

  const filter = { seller: actor.id };
  const [items, total] = await Promise.all([
    OrderItem.find(filter)
      .populate({ path: "order", populate: "customer" })
      .populate("product")
      .sort({ createdAt: -1 })
      .skip(getSkip(params.page, params.limit))
      .limit(params.limit),
    OrderItem.countDocuments(filter),
  ]);
  return buildPaginatedResult(items, total, params.page, params.limit);
}

export async function updateOrderStatus(actor: Actor, orderId: string, status: OrderStatus) {
  if (actor.role !== "ADMIN") throw new ForbiddenError("Only an admin can update order status");

  const order = await Order.findById(orderId);
  if (!order) throw new NotFoundError("Order not found");

  order.status = status;
  await order.save();

  await createNotification({
    user: order.customer.toString(),
    type: "ORDER_STATUS_CHANGED",
    title: "Order status updated",
    message: `Your order #${order.orderNumber} is now ${status.toLowerCase()}.`,
    link: `/orders/${order._id.toString()}`,
  });

  await writeAuditLog({
    actor: actor.id,
    action: "ORDER_STATUS_CHANGED",
    entityType: "Order",
    entityId: orderId,
    meta: { status },
  });

  return order;
}
