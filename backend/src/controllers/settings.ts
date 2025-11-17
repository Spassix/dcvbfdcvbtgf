import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS } from "../db/redis";
import { ApiResponse, ShopSettings, HomeSection } from "@plug-certifie/shared";

const homeSectionSchema = z.object({
  icon: z.string(),
  title: z.string(),
  content: z.string(),
});

const settingsSchema = z.object({
  shopName: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  backgroundImage: z.string().optional(),
  sections: z.array(homeSectionSchema).optional(),
});

export const settingsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const shopName = await redis.get<string>(KEYS.settings("shopName"));
      const heroTitle = await redis.get<string>(KEYS.settings("heroTitle"));
      const heroSubtitle = await redis.get<string>(KEYS.settings("heroSubtitle"));
      const backgroundImage = await redis.get<string>(KEYS.settings("backgroundImage"));
      const sections = await redis.get<HomeSection[]>(KEYS.settings("sections")) || [];

      const settings: ShopSettings = {
        shopName: shopName || "PLUG CERTIFIÉ",
        heroTitle: heroTitle || "",
        heroSubtitle: heroSubtitle || "",
        backgroundImage: backgroundImage || undefined,
        sections: sections,
      };

      const response: ApiResponse<ShopSettings> = {
        success: true,
        data: settings,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async getByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const value = await redis.get(KEYS.settings(key));

      const response: ApiResponse<unknown> = {
        success: true,
        data: value,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const body = settingsSchema.parse(req.body);

      if (body.shopName !== undefined) {
        await redis.set(KEYS.settings("shopName"), body.shopName);
      }
      if (body.heroTitle !== undefined) {
        await redis.set(KEYS.settings("heroTitle"), body.heroTitle);
      }
      if (body.heroSubtitle !== undefined) {
        await redis.set(KEYS.settings("heroSubtitle"), body.heroSubtitle);
      }
      if (body.backgroundImage !== undefined) {
        await redis.set(KEYS.settings("backgroundImage"), body.backgroundImage);
      }
      if (body.sections !== undefined) {
        await redis.set(KEYS.settings("sections"), body.sections);
      }

      const response: ApiResponse<never> = {
        success: true,
        message: "Paramètres mis à jour",
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
};

