import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, Review } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const reviewSchema = z.object({
  customerName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
});

export const reviewsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const reviewIds = await keys("review:*");
      const reviews: Review[] = [];

      for (const key of reviewIds) {
        const review = await redis.get<Review>(key);
        if (review) {
          reviews.push(review);
        }
      }

      const response: ApiResponse<Review[]> = {
        success: true,
        data: reviews,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = reviewSchema.parse(req.body);
      const id = uuidv4();

      const review: Review = {
        id,
        customerName: body.customerName,
        rating: body.rating,
        comment: body.comment,
        createdAt: new Date().toISOString(),
      };

      await redis.set(KEYS.review(id), review);

      const response: ApiResponse<Review> = {
        success: true,
        data: review,
      };

      res.status(201).json(response);
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

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = reviewSchema.partial().parse(req.body);

      const existing = await redis.get<Review>(KEYS.review(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Avis non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      const updated: Review = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.review(id), updated);

      const response: ApiResponse<Review> = {
        success: true,
        data: updated,
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const exists = await redis.exists(KEYS.review(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Avis non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.review(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Avis supprimé",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

