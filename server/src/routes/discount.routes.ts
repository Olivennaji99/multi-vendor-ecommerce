import { Router } from "express";

import { createDiscountSchema } from "@shared/schemas/discount.schema";

import { create, list, remove, setActive } from "../controllers/discount.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/", list);
router.post("/", validate(createDiscountSchema), create);
router.patch("/:id/active", setActive);
router.delete("/:id", remove);

export default router;
