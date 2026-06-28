import { Router } from "express";

import { createReviewSchema } from "@shared/schemas/review.schema";

import { create, forProduct, mine } from "../controllers/review.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/product/:productId", forProduct);
router.get("/mine", requireAuth, requireRole("CUSTOMER"), mine);
router.post("/", requireAuth, requireRole("CUSTOMER"), validate(createReviewSchema), create);

export default router;
