import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiResponse } from "@plug-certifie/shared";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse<never> = {
      success: false,
      error: "Token d'authentification manquant",
    };
    res.status(401).json(response);
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    const response: ApiResponse<never> = {
      success: false,
      error: "Token invalide ou expiré",
    };
    res.status(403).json(response);
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== "admin" && req.userRole !== "superadmin") {
    const response: ApiResponse<never> = {
      success: false,
      error: "Accès refusé. Droits administrateur requis.",
    };
    res.status(403).json(response);
    return;
  }
  next();
}

