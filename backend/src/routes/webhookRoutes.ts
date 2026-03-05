import { Router } from "express";
import { clerkWebhookHandler } from "../controllers/webhookController";

const router = Router();

// This endpoint receives webhooks from Clerk when users are created/updated
router.post("/clerk", clerkWebhookHandler);

export default router;
