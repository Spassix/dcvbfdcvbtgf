import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, Farm } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const farmSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
});

export const farmsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const farmIds = await keys("farm:*");
      const farms: Farm[] = [];

      for (const key of farmIds) {
        const farm = await redis.get<Farm>(key);
        if (farm && farm.enabled) {
          farms.push(farm);
        }
      }

      const response: ApiResponse<Farm[]> = {
        success: true,
        data: farms,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const farm = await redis.get<Farm>(KEYS.farm(id));

      if (!farm) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Ferme non trouvée",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Farm> = {
        success: true,
        data: farm,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = farmSchema.parse(req.body);
      const id = uuidv4();

      const farm: Farm = {
        id,
        name: body.name,
        enabled: body.enabled,
        createdAt: new Date().toISOString(),
      };

      await redis.set(KEYS.farm(id), farm);

      const response: ApiResponse<Farm> = {
        success: true,
        data: farm,
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
      const body = farmSchema.partial().parse(req.body);

      const existing = await redis.get<Farm>(KEYS.farm(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Ferme non trouvée",
        };
        res.status(404).json(response);
        return;
      }

      const updated: Farm = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.farm(id), updated);

      const response: ApiResponse<Farm> = {
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
      const exists = await redis.exists(KEYS.farm(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Ferme non trouvée",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.farm(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Ferme supprimée",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

