import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Anti-cache for sensitive routes
  if (req.path.startsWith("/api/auth") || req.path.startsWith("/api/admin")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  // Remove server header
  res.removeHeader("X-Powered-By");

  next();
}

