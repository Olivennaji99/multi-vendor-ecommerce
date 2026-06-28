import compression from "compression";
import cors from "cors";
import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import discountRoutes from "./routes/discount.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "..", "public", "uploads")));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "@verbum/server", timestamp: new Date().toISOString() });
  });

  const v1 = express.Router();
  v1.use("/auth", authRoutes);
  v1.use("/users", userRoutes);
  v1.use("/sellers", sellerRoutes);
  v1.use("/categories", categoryRoutes);
  v1.use("/products", productRoutes);
  v1.use("/cart", cartRoutes);
  v1.use("/wishlist", wishlistRoutes);
  v1.use("/orders", orderRoutes);
  v1.use("/reviews", reviewRoutes);
  v1.use("/discounts", discountRoutes);
  v1.use("/notifications", notificationRoutes);
  v1.use("/analytics", analyticsRoutes);
  v1.use("/upload", uploadRoutes);
  app.use("/api/v1", v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
