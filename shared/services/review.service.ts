import { Product } from "../models/Product.model";
import { Review } from "../models/Review.model";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors";
import type { CreateReviewInput } from "../schemas/review.schema";
import type { Actor } from "../types/actor";
import { createNotification } from "./notification.service";

async function recalculateProductRating(productId: string) {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const ratingCount = reviews.length;
  const ratingAverage = ratingCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: Math.round(ratingAverage * 10) / 10,
    ratingCount,
  });
}

export async function createReview(actor: Actor, input: CreateReviewInput) {
  if (actor.role !== "CUSTOMER") throw new ForbiddenError("Only customers can leave reviews");

  const product = await Product.findById(input.product);
  if (!product) throw new NotFoundError("Product not found");

  const existing = await Review.findOne({ product: input.product, customer: actor.id });
  if (existing) throw new ConflictError("You have already reviewed this product");

  const review = await Review.create({
    product: input.product,
    customer: actor.id,
    rating: input.rating,
    comment: input.comment,
  });

  await recalculateProductRating(input.product);

  await createNotification({
    user: product.seller.toString(),
    type: "REVIEW_RECEIVED",
    title: "New product review",
    message: `${product.name} received a new ${input.rating}-star review.`,
    link: `/products/${product.slug}`,
  });

  return review;
}

export async function listReviewsForProduct(productId: string, params: { page: number; limit: number }) {
  const filter = { product: productId, isApproved: true };
  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate("customer")
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit),
    Review.countDocuments(filter),
  ]);
  return { items, total };
}

export async function listReviewsForCustomer(actor: Actor) {
  return Review.find({ customer: actor.id }).populate("product").sort({ createdAt: -1 });
}
