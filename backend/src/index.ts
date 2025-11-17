import express from "express";
import cors from "cors";
import { config } from "./config";
import { securityMiddleware } from "./middleware/security";
import { errorHandler } from "./middleware/errorHandler";
import { publicRoutes } from "./routes/public";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";

const app = express();

// Security middleware (must be first)
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

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.port || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

