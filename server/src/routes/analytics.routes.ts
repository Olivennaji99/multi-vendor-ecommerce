import { Router } from "express";

import {
  bestSellingProducts,
  monthlyRevenue,
  ordersOverTime,
  platformStats,
  productPerformance,
  recentOrders,
  sellerPerformance,
  topSellers,
} from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN", "SELLER"));

router.get("/platform-stats", platformStats);
router.get("/monthly-revenue", monthlyRevenue);
router.get("/orders-over-time", ordersOverTime);
router.get("/top-sellers", topSellers);
router.get("/best-selling-products", bestSellingProducts);
router.get("/product-performance", productPerformance);
router.get("/seller-performance", sellerPerformance);
router.get("/recent-orders", recentOrders);

export default router;
