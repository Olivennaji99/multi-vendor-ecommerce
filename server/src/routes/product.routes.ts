import { Router } from "express";

import { paginationSchema } from "@shared/schemas/common.schema";
import { createProductSchema, productFilterSchema, updateProductSchema } from "@shared/schemas/product.schema";

import {
  create,
  getOne,
  list,
  lowStock,
  mine,
  remove,
  update,
} from "../controllers/product.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get(
  "/seller/mine",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  validate(paginationSchema, "query"),
  mine
);
router.get("/low-stock", requireAuth, requireRole("SELLER", "ADMIN"), lowStock);
router.get("/", validate(productFilterSchema, "query"), list);
router.get("/:slug", getOne);
router.post("/", requireAuth, requireRole("SELLER", "ADMIN"), validate(createProductSchema), create);
router.patch(
  "/:id",
  requireAuth,
  requireRole("SELLER", "ADMIN"),
  validate(updateProductSchema),
  update
);
router.delete("/:id", requireAuth, requireRole("SELLER", "ADMIN"), remove);

export default router;
