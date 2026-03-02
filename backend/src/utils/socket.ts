import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { prisma } from "../config/prisma";

// store online users in memory: userId -> socketId
export const onlineUsers: Map<string, string> = new Map();

// Initialize Socket.IO server
export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = [
    "http://localhost:8081", // Expo mobile
    "http://localhost:5173", // Vite web dev
    process.env.FRONTEND_URL, // production
  ].filter(Boolean) as string[];

  // Initialize Socket.IO server
  const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

  // verify socket connection - if the user is authenticated, we will store the user id in the socket
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // this is what user will send from client
    if (!token) return next(new Error("Authentication error: token missing"));

    try {
      // Verify token
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      // Get user ID from Clerk session
      const clerkId = session.sub;

      // Check if the user exists in the database
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) return next(new Error("User not found"));

      socket.data.userId = user.id; // store user id in socket data

      next();
    } catch (error: any) {
      next(new Error(error.message || "Authentication error"));
    }
  });

  // this "connection" event name is special and should be written like this
  // it's the event that is triggered when a new client connects to the server
  io.on("connection", (socket) => {
    const userId = socket.data.userId;

    // send list of currently online users to the newly connected client
    socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

    // store user in the onlineUsers map
    onlineUsers.set(userId, socket.id);

    // notify others that this current user is online
    socket.broadcast.emit("user-online", { userId });

    socket.join(`user:${userId}`); // join user room

    socket.on("join-chat", (chatId: string) => {
      socket.join(`chat:${chatId}`); // join chat room
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`); // leave chat room
    });

    // handle sending messages
    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;

          // Verify chat exists and user is a participant
          const chat = await prisma.chat.findFirst({
            where: {
              id: chatId,
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
                },
              },
            },
          });

          if (!chat) {
            socket.emit("socket-error", { message: "Chat not found" });
            return;
          }

          // Create message
          const message = await prisma.message.create({
            data: {
              chatId,
              senderId: userId,
              text,
            },
            include: {
              sender: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          });

          // Update last message in chat
          await prisma.chat.update({
            where: { id: chatId },
            data: {
              lastMessageId: message.id,
              lastMessageAt: new Date(),
            },
          });

          // emit to chat room (for users inside the chat)
          io.to(`chat:${chatId}`).emit("new-message", message);

          // also emit to participants' personal rooms (for chat list view)
          for (const participant of chat.participants) {
            io.to(`user:${participant.id}`).emit("new-message", message);
          }
        } catch (error) {
          console.error("Socket error:", error);
          socket.emit("socket-error", { message: "Failed to send message" });
        }
      },
    );

    socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
      const typingPayload = {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      };

      // emit to chat room (for users inside the chat)
      socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);

      // also emit to other participant's personal room (for chat list view)
      try {
        const chat = await prisma.chat.findUnique({
          where: { id: data.chatId },
          include: {
            participants: {
              select: {
                id: true,
              },
            },
          },
        });

        if (chat) {
          const otherParticipant = chat.participants.find(
            (p) => p.id !== userId,
          );
          if (otherParticipant) {
            socket
              .to(`user:${otherParticipant.id}`)
              .emit("typing", typingPayload);
          }
        }
      } catch (error) {
        // silently fail - typing indicator is not critical
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);

      // notify others
      socket.broadcast.emit("user-offline", { userId });
    });
  });

  return io;
};
