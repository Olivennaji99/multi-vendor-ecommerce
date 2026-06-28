import { Router } from "express";

import { listUsersQuerySchema, updateUserSchema } from "@shared/schemas/user.schema";

import { list, setActive, updateMe } from "../controllers/user.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), validate(listUsersQuerySchema, "query"), list);
router.patch("/me", requireAuth, validate(updateUserSchema), updateMe);
router.patch("/:id/active", requireAuth, requireRole("ADMIN"), setActive);

export default router;
