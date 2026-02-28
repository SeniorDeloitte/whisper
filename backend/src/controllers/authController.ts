import type { AuthRequest } from "../middleware/auth";
import type { NextFunction, Response } from "express";

import { prisma } from "../config/prisma";
import { clerkClient, getAuth } from "@clerk/express";

export async function getCurrentUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - user ID not found" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function authCallback(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
      return res
        .status(401)
        .json({ message: "Unauthorized - user ID not found" });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) {
      // get user info from clerk
      const clerkUser = await clerkClient.users.getUser(clerkId);

      // create user in db
      await prisma.user.create({
        data: {
          clerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.fullName || "",
          avatar: clerkUser.imageUrl || "",
        },
      });
    }

    return res.status(201).json(user);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
