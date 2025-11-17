import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, LoginRequest, LoginResponse, AdminUser } from "@plug-certifie/shared";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const body = loginSchema.parse(req.body) as LoginRequest;

      // Get all admin users
      // Note: Upstash Redis pattern matching may need adjustment
      const userIds = await keys("admin:user:*");
      let user: AdminUser | null = null;
      let userId: string | null = null;

      // Find user by email
      for (const key of userIds) {
        const candidate = await redis.get<AdminUser>(key);
        if (candidate && candidate.email === body.email) {
          user = candidate;
          userId = key.replace("admin:user:", "");
          break;
        }
      }

      if (!user || !userId) {
        // Log failed login attempt (sanitized)
        console.warn("Failed login attempt:", { email: body.email, timestamp: new Date().toISOString() });

        const response: ApiResponse<never> = {
          success: false,
          error: "Email ou mot de passe incorrect",
        };
        res.status(401).json(response);
        return;
      }

      // Get password hash from separate key (never stored with user object)
      const passwordHash = await redis.get<string>(`admin:password:${userId}`);
      if (!passwordHash) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Email ou mot de passe incorrect",
        };
        res.status(401).json(response);
        return;
      }

      // Verify password
      const isValid = await bcrypt.compare(body.password, passwordHash);
      if (!isValid) {
        console.warn("Failed login attempt:", { email: body.email, timestamp: new Date().toISOString() });
        const response: ApiResponse<never> = {
          success: false,
          error: "Email ou mot de passe incorrect",
        };
        res.status(401).json(response);
        return;
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId, role: user.role },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      const response: ApiResponse<LoginResponse> = {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: userId,
            email: user.email,
            role: user.role,
          },
        },
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse<never> = {
          success: false,
          error: error.errors[0]?.message || "Données invalides",
        };
        res.status(400).json(response);
        return;
      }
      throw error;
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Refresh token manquant",
        };
        res.status(400).json(response);
        return;
      }

      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string; role: string };

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId, role: decoded.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const response: ApiResponse<{ accessToken: string }> = {
        success: true,
        data: { accessToken },
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<never> = {
        success: false,
        error: "Refresh token invalide ou expiré",
      };
      res.status(403).json(response);
    }
  },
};

