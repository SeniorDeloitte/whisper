import express from "express";
import { clerkMiddleware } from "@clerk/express";
// Import routes
import { authRoutes, chatRoutes, messageRoutes, userRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Parse JSON bodies
app.use(express.json());

// Apply Clerk middleware to all routes
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

// Error handler middleware
app.use(errorHandler);

export default app;
