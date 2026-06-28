import { Router } from "express";

import { changePasswordSchema, loginSchema, registerCustomerBaseSchema } from "@shared/schemas/auth.schema";

import { changeOwnPassword, login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerCustomerBaseSchema), register);
router.post("/change-password", requireAuth, validate(changePasswordSchema), changeOwnPassword);
router.get("/me", requireAuth, me);

export default router;
