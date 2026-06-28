import { Router } from "express";

import { list, markAllRead, markRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", list);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;
