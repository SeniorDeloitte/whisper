import type { Request, Response, NextFunction } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { prisma } from "../config/prisma";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protectedRoute = [
  requireAuth,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get the user ID from the Clerk token
      const { userId: clerkId } = getAuth(req);

      if (!clerkId) {
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
      }

      // Check if the user exists in the database
      const user = await prisma.user.findUnique({
        where: {
          clerkId,
        },
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized - user not found" });
      }

      // Set the user ID on the request object
      req.userId = user.id.toString();

      next();
    } catch (error) {
      res.status(500);
      next(error);
    }
  },
];
