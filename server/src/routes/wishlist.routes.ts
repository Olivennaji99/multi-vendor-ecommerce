import { Router } from "express";

import { add, get, remove } from "../controllers/wishlist.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("CUSTOMER"));

router.get("/", get);
router.post("/:productId", add);
router.delete("/:productId", remove);

export default router;
