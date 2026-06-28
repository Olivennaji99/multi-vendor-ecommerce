import { Router } from "express";

import { createCategorySchema, updateCategorySchema } from "@shared/schemas/category.schema";

import { create, getOne, list, remove, update } from "../controllers/category.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", list);
router.get("/:slug", getOne);
router.post("/", requireAuth, requireRole("ADMIN"), validate(createCategorySchema), create);
router.patch("/:id", requireAuth, requireRole("ADMIN"), validate(updateCategorySchema), update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), remove);

export default router;
