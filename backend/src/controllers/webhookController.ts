import type { Request, Response } from "express";
import { Webhook } from "svix";
import { prisma } from "../config/prisma";

// Your Clerk Webhook Secret from the Clerk Dashboard
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  if (!WEBHOOK_SECRET) {
    console.error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env");
    res.status(500).json({ error: "Configuration Error" });
    return;
  }

  // Get the headers
  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;

  // If there are no svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({ error: "Error occurred -- no svix headers" });
    return;
  }

  // Get the body
  let payload: string;
  try {
    // Assuming express.raw() is used, req.body is a Buffer
    payload = req.body.toString("utf8");
  } catch (err) {
    console.error("Error reading body", err);
    res.status(400).json({ error: "Error occurred" });
    return;
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    res.status(400).json({ error: "Error verifying webhook" });
    return;
  }

  // Handle the event
  const { id } = evt.data;
  const eventType = evt.type;

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const email = evt.data.email_addresses?.[0]?.email_address || "";
      const firstName = evt.data.first_name || "";
      const lastName = evt.data.last_name || "";
      const name = `${firstName} ${lastName}`.trim() || "User";
      const avatar = evt.data.image_url || "";

      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          name,
          email,
          avatar,
        },
        create: {
          clerkId: id,
          name,
          email,
          avatar,
        },
      });

      console.log(`User ${id} was ${eventType === "user.created" ? "created" : "updated"} via webhook.`);
    }

    if (eventType === "user.deleted") {
      await prisma.user.delete({
        where: { clerkId: id },
      });
      console.log(`User ${id} was deleted via webhook.`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${eventType}:`, error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  res.status(200).json({ success: true });
};
