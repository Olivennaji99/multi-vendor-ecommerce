import { Router } from "express";

import { paginationSchema } from "@shared/schemas/common.schema";
import { createOrderSchema, listOrdersQuerySchema, updateOrderStatusSchema } from "@shared/schemas/order.schema";

import {
  adminList,
  create,
  getOne,
  history,
  sellerMine,
  updateStatus,
} from "../controllers/order.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get(
  "/admin/all",
  requireAuth,
  requireRole("ADMIN"),
  validate(listOrdersQuerySchema, "query"),
  adminList
);
router.get(
  "/seller/mine",
  requireAuth,
  requireRole("SELLER"),
  validate(paginationSchema, "query"),
  sellerMine
);
router.get("/", requireAuth, requireRole("CUSTOMER"), validate(paginationSchema, "query"), history);
router.post("/", requireAuth, requireRole("CUSTOMER"), validate(createOrderSchema), create);
router.get("/:id", requireAuth, getOne);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateOrderStatusSchema),
  updateStatus
);

export default router;
