import { Router } from "express";

import { addToCartSchema, updateCartItemSchema } from "@shared/schemas/cart.schema";

import { add, clear, get, remove, updateQuantity } from "../controllers/cart.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("CUSTOMER"));

router.get("/", get);
router.post("/", validate(addToCartSchema), add);
router.patch("/:itemId", validate(updateCartItemSchema), updateQuantity);
router.delete("/:itemId", remove);
router.delete("/", clear);

export default router;
