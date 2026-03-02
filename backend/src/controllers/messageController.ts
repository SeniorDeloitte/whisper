import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

export async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { chatId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!chatId) {
      res.status(400).json({ message: "Chat ID is required" });
      return;
    }

    // Verify chat existence and participation
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId as string,
        participants: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId as string,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc", // oldest first
      },
    });

    res.json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
