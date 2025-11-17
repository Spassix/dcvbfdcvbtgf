import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, Category } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
});

export const categoriesController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const categoryIds = await keys("category:*");
      const categories: Category[] = [];

      for (const key of categoryIds) {
        const category = await redis.get<Category>(key);
        if (category) {
          categories.push(category);
        }
      }

      const response: ApiResponse<Category[]> = {
        success: true,
        data: categories,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await redis.get<Category>(KEYS.category(id));

      if (!category) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Catégorie non trouvée",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Category> = {
        success: true,
        data: category,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = categorySchema.parse(req.body);
      const id = uuidv4();

      const category: Category = {
        id,
        name: body.name,
        icon: body.icon,
        createdAt: new Date().toISOString(),
      };

      await redis.set(KEYS.category(id), category);

      const response: ApiResponse<Category> = {
        success: true,
        data: category,
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
      const body = categorySchema.partial().parse(req.body);

      const existing = await redis.get<Category>(KEYS.category(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Catégorie non trouvée",
        };
        res.status(404).json(response);
        return;
      }

      const updated: Category = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.category(id), updated);

      const response: ApiResponse<Category> = {
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
      const exists = await redis.exists(KEYS.category(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Catégorie non trouvée",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.category(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Catégorie supprimée",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

