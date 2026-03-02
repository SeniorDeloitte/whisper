import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

export async function getUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 100,
    });

    res.json(users);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
