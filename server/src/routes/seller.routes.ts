import { Router } from "express";

import { createSellerSchema, listSellersQuerySchema, updateSellerSchema } from "@shared/schemas/seller.schema";

import { create, getOne, list, top, update } from "../controllers/seller.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/top", top);
router.get("/:id", getOne);
router.get("/", requireAuth, requireRole("ADMIN"), validate(listSellersQuerySchema, "query"), list);
router.post("/", requireAuth, requireRole("ADMIN"), validate(createSellerSchema), create);
router.patch("/:id", requireAuth, validate(updateSellerSchema), update);

export default router;
