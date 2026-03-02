import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";

export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        lastMessage: true,
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find((p) => p.id !== userId);

      return {
        _id: chat.id,
        participant: otherParticipant
          ? { ...otherParticipant, _id: otherParticipant.id }
          : null,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      };
    });

    res.json(formattedChats);
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function getOrCreateChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { participantId } = req.params;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!participantId) {
      res.status(400).json({ message: "Participant ID is required" });
      return;
    }

    if (userId === participantId) {
      res.status(400).json({ message: "Cannot create chat with yourself" });
      return;
    }

    // Check if chat already exists
    // We are looking for a chat where BOTH users are participants
    let chat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                id: userId,
              },
            },
          },
          {
            participants: {
              some: {
                id: participantId as string,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        lastMessage: true,
      },
    });

    if (!chat) {
      // Create new chat
      chat = await prisma.chat.create({
        data: {
          participants: {
            connect: [{ id: userId }, { id: participantId as string }],
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          lastMessage: true,
        },
      });
    }

    const otherParticipant = chat.participants.find((p) => p.id !== userId);

    res.json({
      _id: chat.id,
      participant: otherParticipant
        ? { ...otherParticipant, _id: otherParticipant.id }
        : null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    console.error("Error in getOrCreateChat:", error);
    res.status(500).json({ message: "Internal server error" });
    next(error);
  }
}
