import type { Request, Response } from "express";

import {
  getBestSellingProducts,
  getMonthlyRevenue,
  getOrdersOverTime,
  getPlatformStats,
  getProductPerformance,
  getRecentOrders,
  getSellerPerformance,
  getTopSellersByRevenue,
} from "@shared/services/analytics.service";
import { UnauthorizedError } from "@shared/lib/errors";

export async function platformStats(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const stats = await getPlatformStats(req.user);
  res.json({ success: true, data: stats });
}

export async function monthlyRevenue(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const months = Number(req.query.months ?? 6);
  const sellerId = req.query.sellerId as string | undefined;
  const data = await getMonthlyRevenue(req.user, months, sellerId);
  res.json({ success: true, data });
}

export async function ordersOverTime(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const months = Number(req.query.months ?? 6);
  const data = await getOrdersOverTime(req.user, months);
  res.json({ success: true, data });
}

export async function topSellers(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const limit = Number(req.query.limit ?? 5);
  const data = await getTopSellersByRevenue(req.user, limit);
  res.json({ success: true, data });
}

export async function bestSellingProducts(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const limit = Number(req.query.limit ?? 5);
  const sellerId = req.query.sellerId as string | undefined;
  const data = await getBestSellingProducts(req.user, limit, sellerId);
  res.json({ success: true, data });
}

export async function productPerformance(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const sellerId = req.query.sellerId as string | undefined;
  const limit = Number(req.query.limit ?? 10);
  const data = await getProductPerformance(req.user, sellerId, limit);
  res.json({ success: true, data });
}

export async function sellerPerformance(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const limit = Number(req.query.limit ?? 10);
  const data = await getSellerPerformance(req.user, limit);
  res.json({ success: true, data });
}

export async function recentOrders(req: Request, res: Response) {
  if (!req.user) throw new UnauthorizedError();
  const limit = Number(req.query.limit ?? 5);
  const sellerId = req.query.sellerId as string | undefined;
  const data = await getRecentOrders(req.user, limit, sellerId);
  res.json({ success: true, data });
}
