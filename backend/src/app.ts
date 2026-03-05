import express from "express";
import path from "path";
import cors from "cors";

import { clerkMiddleware } from "@clerk/express";

import { authRoutes, chatRoutes, messageRoutes, userRoutes, webhookRoutes } from "./routes";

import { errorHandler } from "./middleware/errorHandler";

const app = express();

const allowedOrigins = [
  "http://localhost:8081", // expo mobile
  "http://localhost:5173", // vite web devs
  process.env.FRONTEND_URL!, // production
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow credentials from client (cookies, authorization headers, etc.)
  }),
);

// We need the raw body for Stripe/Clerk webhooks signature verification
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json()); // parses incoming JSON request bodies and makes them available as req.body in your route handlers
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(clerkMiddleware());

app.get("/api/test", (req, res) => {
  res.send("test ok");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use((req, res, next) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).send(`La ruta ${req.url} no existe en este servidor.`);
});

// error handlers must come after all the routes and other middlewares so they can catch errors passed with next(err) or thrown inside async handlers.
app.use(errorHandler);

// serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist")));

  app.get("/{*any}", (_, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}

export default app;
