import rateLimit from "express-rate-limit";
import { config } from "../config";

export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: "Trop de requêtes. Veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 200, // Higher limit for admin
  message: "Trop de requêtes. Veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

