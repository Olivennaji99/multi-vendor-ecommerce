import mongoose from "mongoose";

import { Order } from "../models/Order.model";
import { OrderItem } from "../models/OrderItem.model";
import { Product } from "../models/Product.model";
import { SellerProfile } from "../models/SellerProfile.model";
import { ForbiddenError } from "../lib/errors";
import type { Actor } from "../types/actor";

const COMPLETED_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

function assertAdminOrOwningSeller(actor: Actor, sellerId?: string) {
  if (actor.role === "ADMIN") return;
  if (actor.role === "SELLER" && sellerId === actor.id) return;
  throw new ForbiddenError();
}

function assertAdmin(actor: Actor) {
  if (actor.role !== "ADMIN") throw new ForbiddenError();
}

export async function getPlatformStats(actor: Actor) {
  assertAdmin(actor);

  const [totalProducts, totalOrders, revenueAgg] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments({}),
    Order.aggregate([
      { $match: { status: { $in: COMPLETED_STATUSES } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  return { totalProducts, totalOrders, totalRevenue: revenueAgg[0]?.total ?? 0 };
}

function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - (months - 1));
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getMonthlyRevenue(actor: Actor, months = 6, sellerId?: string) {
  assertAdminOrOwningSeller(actor, sellerId);
  const since = monthsAgo(months);

  if (sellerId) {
    const results = await OrderItem.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
      { $lookup: { from: "orders", localField: "order", foreignField: "_id", as: "order" } },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": { $gte: since },
          "order.status": { $in: COMPLETED_STATUSES },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$order.createdAt" }, month: { $month: "$order.createdAt" } },
          revenue: { $sum: { $multiply: ["$priceSnapshot", "$quantity"] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    return results.map((r) => ({
      month: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
      revenue: r.revenue,
    }));
  }

  const results = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $in: COMPLETED_STATUSES } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return results.map((r) => ({
    month: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
    revenue: r.revenue,
    orders: r.orders,
  }));
}

export async function getOrdersOverTime(actor: Actor, months = 6) {
  assertAdmin(actor);
  const since = monthsAgo(months);

  const results = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return results.map((r) => ({
    month: `${r._id.year}-${String(r._id.month).padStart(2, "0")}`,
    orders: r.count,
  }));
}

export async function getTopSellersByRevenue(actor: Actor, limit = 5) {
  assertAdmin(actor);

  const results = await OrderItem.aggregate([
    {
      $group: {
        _id: "$seller",
        revenue: { $sum: { $multiply: ["$priceSnapshot", "$quantity"] } },
        unitsSold: { $sum: "$quantity" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $lookup: { from: "sellerprofiles", localField: "_id", foreignField: "user", as: "profile" } },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
  ]);

  return results.map((r) => ({
    sellerId: r._id.toString(),
    name: r.user.name as string,
    storeName: (r.profile?.storeName as string | undefined) ?? r.user.name,
    revenue: r.revenue as number,
    unitsSold: r.unitsSold as number,
  }));
}

export async function getBestSellingProducts(actor: Actor | null, limit = 5, sellerId?: string) {
  if (actor) assertAdminOrOwningSeller(actor, sellerId);

  const match: Record<string, unknown> = {};
  if (sellerId) match.seller = new mongoose.Types.ObjectId(sellerId);

  const results = await OrderItem.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$product",
        unitsSold: { $sum: "$quantity" },
        revenue: { $sum: { $multiply: ["$priceSnapshot", "$quantity"] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
  ]);

  return results.map((r) => ({
    productId: r._id.toString(),
    name: r.product.name as string,
    slug: r.product.slug as string,
    unitsSold: r.unitsSold as number,
    revenue: r.revenue as number,
  }));
}

export async function getProductPerformance(actor: Actor, sellerId?: string, limit = 10) {
  assertAdminOrOwningSeller(actor, sellerId);

  const filter: Record<string, unknown> = {};
  if (sellerId) filter.seller = sellerId;
  return Product.find(filter)
    .select("name slug price stock viewCount ratingAverage ratingCount")
    .sort({ viewCount: -1 })
    .limit(limit);
}

export async function getSellerPerformance(actor: Actor, limit = 10) {
  assertAdmin(actor);
  return SellerProfile.find({}).populate("user").sort({ totalRevenue: -1 }).limit(limit);
}

export async function getRecentOrders(actor: Actor, limit = 5, sellerId?: string) {
  assertAdminOrOwningSeller(actor, sellerId);

  if (sellerId) {
    return OrderItem.find({ seller: sellerId })
      .populate({ path: "order", populate: "customer" })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
  return Order.find({}).populate("customer").sort({ createdAt: -1 }).limit(limit);
}
