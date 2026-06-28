import { Discount, type IDiscount } from "../models/Discount.model";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import type { CreateDiscountInput } from "../schemas/discount.schema";
import type { Actor } from "../types/actor";
import { writeAuditLog } from "./audit.service";

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

export function computeDiscountedPrice(price: number, discount: IDiscount | null | undefined): number {
  if (!discount || !discount.isActive) return price;

  const now = new Date();
  if (now < discount.startsAt || now > discount.endsAt) return price;

  if (discount.type === "PERCENTAGE") {
    return Math.max(0, Math.round(price * (1 - discount.value / 100) * 100) / 100);
  }
  return Math.max(0, Math.round((price - discount.value) * 100) / 100);
}

export function computeDiscountPercentage(price: number, discountedPrice: number): number {
  if (price <= 0 || discountedPrice >= price) return 0;
  return Math.round((1 - discountedPrice / price) * 100);
}

/** Creates a standing PRODUCT discount from a seller/admin-entered "discount price" on the product form. */
export async function createProductPriceDiscount(
  actor: Actor,
  productId: string,
  price: number,
  discountPrice: number
) {
  const value = Math.max(0, price - discountPrice);
  return Discount.create({
    name: "Product discount",
    type: "FIXED",
    value,
    appliesTo: "PRODUCT",
    products: [productId],
    startsAt: new Date(),
    endsAt: new Date(Date.now() + TEN_YEARS_MS),
    isFlashSale: false,
    isActive: true,
    createdBy: actor.id,
  });
}

export async function createDiscount(actor: Actor, input: CreateDiscountInput) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const discount = await Discount.create({ ...input, createdBy: actor.id });

  await writeAuditLog({
    actor: actor.id,
    action: "DISCOUNT_CREATED",
    entityType: "Discount",
    entityId: discount._id.toString(),
  });

  return discount;
}

export async function listDiscounts(actor: Actor) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();
  return Discount.find({}).sort({ createdAt: -1 }).populate("products").populate("categories");
}

export async function setDiscountActive(actor: Actor, discountId: string, isActive: boolean) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const discount = await Discount.findById(discountId);
  if (!discount) throw new NotFoundError("Discount not found");

  discount.isActive = isActive;
  await discount.save();

  await writeAuditLog({
    actor: actor.id,
    action: "DISCOUNT_UPDATED",
    entityType: "Discount",
    entityId: discountId,
  });

  return discount;
}

export async function deleteDiscount(actor: Actor, discountId: string) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();

  const discount = await Discount.findByIdAndDelete(discountId);
  if (!discount) throw new NotFoundError("Discount not found");

  await writeAuditLog({
    actor: actor.id,
    action: "DISCOUNT_DELETED",
    entityType: "Discount",
    entityId: discountId,
  });
}
