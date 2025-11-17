// Vercel serverless function handler
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import cors from "cors";
import { config } from "../backend/src/config";
import { securityMiddleware } from "../backend/src/middleware/security";
import { errorHandler } from "../backend/src/middleware/errorHandler";
import { publicRoutes } from "../backend/src/routes/public";
import { adminRoutes } from "../backend/src/routes/admin";
import { authRoutes } from "../backend/src/routes/auth";

// Create Express app
const app = express();

// Security middleware
app.use(securityMiddleware);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", publicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", adminRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(errorHandler);

// Vercel serverless function handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Remove /api prefix if present
  if (req.url?.startsWith("/api")) {
    req.url = req.url.replace("/api", "") || "/";
  }
  
  return app(req, res);
}
