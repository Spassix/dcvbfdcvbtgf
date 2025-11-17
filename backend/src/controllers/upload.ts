import { Request, Response } from "express";
import { ApiResponse } from "@plug-certifie/shared";

// Placeholder for upload functionality
// In production, integrate with Vercel Blob or Cloudflare R2
export const uploadController = {
  async upload(_req: Request, res: Response): Promise<void> {
    // TODO: Implement file upload to Vercel Blob or R2
    const response: ApiResponse<{ url: string }> = {
      success: false,
      error: "Upload non implémenté. Configurez Vercel Blob ou Cloudflare R2.",
    };
    res.status(501).json(response);
  },

  async blobUpload(_req: Request, res: Response): Promise<void> {
    // TODO: Implement blob upload
    const response: ApiResponse<{ url: string }> = {
      success: false,
      error: "Upload non implémenté. Configurez Vercel Blob ou Cloudflare R2.",
    };
    res.status(501).json(response);
  },
};

