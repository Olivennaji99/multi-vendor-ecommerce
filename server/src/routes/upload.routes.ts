import { Router } from "express";

import { uploadFile } from "../controllers/upload.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", requireAuth, requireRole("SELLER", "ADMIN"), upload.single("file"), uploadFile);

export default router;
