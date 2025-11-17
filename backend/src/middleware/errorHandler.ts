import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { ApiResponse } from "@plug-certifie/shared";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error (sanitized, no sensitive data)
  console.error("Error:", {
    message: err.message,
    stack: config.nodeEnv === "development" ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Never expose internal errors to client
  const response: ApiResponse<never> = {
    success: false,
    error: config.nodeEnv === "production" 
      ? "Une erreur est survenue. Veuillez réessayer plus tard."
      : err.message,
  };

  res.status(500).json(response);
}

