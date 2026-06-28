import { Wishlist } from "../models/Wishlist.model";
import { NotFoundError } from "../lib/errors";
import type { Actor } from "../types/actor";

async function getOrCreateWishlistDoc(customerId: string) {
  let wishlist = await Wishlist.findOne({ customer: customerId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ customer: customerId, products: [] });
  }
  return wishlist;
}

export async function getWishlist(actor: Actor) {
  const wishlist = await getOrCreateWishlistDoc(actor.id);
  return Wishlist.findById(wishlist._id).populate({
    path: "products",
    populate: ["category", "images", "discount"],
  });
}

export async function addToWishlist(actor: Actor, productId: string) {
  const wishlist = await getOrCreateWishlistDoc(actor.id);
  if (!wishlist.products.some((id) => id.toString() === productId)) {
    wishlist.products.push(productId as never);
    await wishlist.save();
  }
  return wishlist;
}

export async function removeFromWishlist(actor: Actor, productId: string) {
  const wishlist = await Wishlist.findOne({ customer: actor.id });
  if (!wishlist) throw new NotFoundError("Wishlist not found");

  wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
  await wishlist.save();
  return wishlist;
}
