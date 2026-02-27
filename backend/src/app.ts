import express from "express";

// Import routes
import { authRoutes, chatRoutes, messageRoutes, userRoutes } from "./routes";

const app = express();

app.use(express.json()); // Parse JSON bodies

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

export default app;
