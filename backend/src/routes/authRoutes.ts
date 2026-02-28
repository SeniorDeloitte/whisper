import { Router } from "express";
import { authCallback, getCurrentUser } from "../controllers/authController";
import { protectedRoute } from "../middleware/auth";

const router = Router();

router.get("/current-user", protectedRoute, getCurrentUser);
router.post("/callback", protectedRoute, authCallback);

export default router;
