import { Cart } from "../models/Cart.model";
import { CartItem } from "../models/CartItem.model";
import type { IDiscount } from "../models/Discount.model";
import { Product } from "../models/Product.model";
import { DEFAULT_SHIPPING_FEE } from "../constants";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors";
import type { Actor } from "../types/actor";
import { computeDiscountedPrice } from "./discount.service";

interface PopulatedCartItem {
  _id: { toString(): string };
  quantity: number;
  product: {
    price: number;
    discount: IDiscount | null;
  };
}

async function getOrCreateCartDoc(customerId: string) {
  let cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }
  return cart;
}

export async function getCart(actor: Actor) {
  const cart = await getOrCreateCartDoc(actor.id);
  const items = await CartItem.find({ cart: cart._id }).populate({
    path: "product",
    populate: ["category", "images", "discount"],
  });
  return { cart, items };
}

export async function addToCart(actor: Actor, productId: string, quantity: number) {
  const product = await Product.findById(productId).populate("discount");
  if (!product || !product.isActive) throw new NotFoundError("Product not found");
  if (product.stock < 1) throw new ValidationError("This product is out of stock");

  const cart = await getOrCreateCartDoc(actor.id);
  const discountedPrice = computeDiscountedPrice(product.price, product.discount as unknown as IDiscount | null);

  let item = await CartItem.findOne({ cart: cart._id, product: productId });
  if (item) {
    item.quantity = Math.min(product.stock, item.quantity + quantity);
    item.priceSnapshot = discountedPrice;
    await item.save();
  } else {
    item = await CartItem.create({
      cart: cart._id,
      product: productId,
      quantity: Math.min(product.stock, quantity),
      priceSnapshot: discountedPrice,
    });
    cart.items.push(item._id);
    await cart.save();
  }

  return item;
}

export async function updateCartItemQuantity(actor: Actor, itemId: string, quantity: number) {
  const item = await CartItem.findById(itemId);
  if (!item) throw new NotFoundError("Cart item not found");

  const cart = await Cart.findById(item.cart);
  if (!cart || cart.customer.toString() !== actor.id) throw new ForbiddenError();

  const product = await Product.findById(item.product);
  if (!product) throw new NotFoundError("Product not found");

  item.quantity = Math.min(product.stock, Math.max(1, quantity));
  await item.save();
  return item;
}

export async function removeCartItem(actor: Actor, itemId: string) {
  const item = await CartItem.findById(itemId);
  if (!item) throw new NotFoundError("Cart item not found");

  const cart = await Cart.findById(item.cart);
  if (!cart || cart.customer.toString() !== actor.id) throw new ForbiddenError();

  await CartItem.deleteOne({ _id: itemId });
  cart.items = cart.items.filter((id) => id.toString() !== itemId);
  await cart.save();
}

export async function clearCart(actor: Actor) {
  const cart = await Cart.findOne({ customer: actor.id });
  if (!cart) return;
  await CartItem.deleteMany({ cart: cart._id });
  cart.items = [];
  await cart.save();
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
}

export async function computeCartTotals(actor: Actor): Promise<CartTotals> {
  const { items } = await getCart(actor);
  const populatedItems = items as unknown as PopulatedCartItem[];

  let subtotal = 0;
  let discountTotal = 0;

  for (const item of populatedItems) {
    const originalLineTotal = item.product.price * item.quantity;
    const discountedPrice = computeDiscountedPrice(item.product.price, item.product.discount);
    const discountedLineTotal = discountedPrice * item.quantity;

    subtotal += originalLineTotal;
    discountTotal += originalLineTotal - discountedLineTotal;
  }

  const shippingFee = populatedItems.length > 0 ? DEFAULT_SHIPPING_FEE : 0;
  const total = Math.max(0, subtotal - discountTotal + shippingFee);

  return { subtotal, discountTotal, shippingFee, total };
}
