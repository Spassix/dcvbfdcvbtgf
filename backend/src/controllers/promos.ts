import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, Promo, PromoType } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const promoSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percent", "fixed"]),
  value: z.number().positive(),
  minAmount: z.number().min(0),
  enabled: z.boolean(),
});

export const promosController = {
  async getPublic(_req: Request, res: Response): Promise<void> {
    try {
      const promoIds = await keys("promo:*");
      const promos: Promo[] = [];

      for (const key of promoIds) {
        const promo = await redis.get<Promo>(key);
        if (promo && promo.enabled) {
          // Only return code and enabled status for public
          promos.push({
            id: promo.id,
            code: promo.code,
            type: promo.type,
            value: promo.value,
            minAmount: promo.minAmount,
            enabled: promo.enabled,
          });
        }
      }

      const response: ApiResponse<Promo[]> = {
        success: true,
        data: promos,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = promoSchema.parse(req.body);
      const id = uuidv4();

      const promo: Promo = {
        id,
        code: body.code.toUpperCase(),
        type: body.type,
        value: body.value,
        minAmount: body.minAmount,
        enabled: body.enabled,
        createdAt: new Date().toISOString(),
      };

      await redis.set(KEYS.promo(id), promo);

      const response: ApiResponse<Promo> = {
        success: true,
        data: promo,
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
      const body = promoSchema.partial().parse(req.body);

      const existing = await redis.get<Promo>(KEYS.promo(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Code promo non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      const updated: Promo = {
        ...existing,
        ...body,
        code: body.code ? body.code.toUpperCase() : existing.code,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.promo(id), updated);

      const response: ApiResponse<Promo> = {
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
      const exists = await redis.exists(KEYS.promo(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Code promo non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.promo(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Code promo supprimé",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

