import { Discount } from "../models/Discount.model";
import { Product } from "../models/Product.model";

const POPULATE = ["category", "images", "discount"];

export async function getFeaturedProducts(limit = 8) {
  return Product.find({ isFeatured: true, isActive: true }).populate(POPULATE).limit(limit);
}

export async function getTrendingProducts(limit = 8) {
  return Product.find({ isTrending: true, isActive: true })
    .populate(POPULATE)
    .sort({ viewCount: -1 })
    .limit(limit);
}

export async function getRecommendedProducts(limit = 8) {
  return Product.find({ isRecommended: true, isActive: true }).populate(POPULATE).limit(limit);
}

export async function getNewArrivals(limit = 8) {
  return Product.find({ isActive: true }).populate(POPULATE).sort({ createdAt: -1 }).limit(limit);
}

export async function getFlashSaleProducts(limit = 8) {
  const now = new Date();
  const activeFlashSales = await Discount.find({
    isFlashSale: true,
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id endsAt");

  if (activeFlashSales.length === 0) return { products: [], endsAt: null as Date | null };

  const discountIds = activeFlashSales.map((d) => d._id);
  const products = await Product.find({ discount: { $in: discountIds }, isActive: true })
    .populate(POPULATE)
    .limit(limit);

  const soonestEnd = activeFlashSales.reduce(
    (earliest, d) => (d.endsAt < earliest ? d.endsAt : earliest),
    activeFlashSales[0].endsAt
  );

  return { products, endsAt: soonestEnd as Date | null };
}

export async function getBestDeals(limit = 8) {
  const now = new Date();
  const activeDiscounts = await Discount.find({
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).select("_id");

  return Product.find({ discount: { $in: activeDiscounts.map((d) => d._id) }, isActive: true })
    .populate(POPULATE)
    .sort({ ratingAverage: -1 })
    .limit(limit);
}
