import { Router } from "express";
import { authRateLimit } from "../middleware/rateLimit";
import { authController } from "../controllers/auth";

export const authRoutes = Router();

authRoutes.post("/login", authRateLimit, authController.login);
authRoutes.post("/refresh", authRateLimit, authController.refresh);

