import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, SocialLink } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const socialLinkSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  url: z.string().url(),
});

export const socialsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const socialIds = await keys("social:*");
      const socials: SocialLink[] = [];

      for (const key of socialIds) {
        const social = await redis.get<SocialLink>(key);
        if (social) {
          socials.push(social);
        }
      }

      const response: ApiResponse<SocialLink[]> = {
        success: true,
        data: socials,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = socialLinkSchema.parse(req.body);
      const id = uuidv4();

      const social: SocialLink = {
        id,
        name: body.name,
        icon: body.icon,
        url: body.url,
        createdAt: new Date().toISOString(),
      };

      await redis.set(KEYS.socialLink(id), social);

      const response: ApiResponse<SocialLink> = {
        success: true,
        data: social,
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
      const body = socialLinkSchema.partial().parse(req.body);

      const existing = await redis.get<SocialLink>(KEYS.socialLink(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Lien social non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      const updated: SocialLink = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.socialLink(id), updated);

      const response: ApiResponse<SocialLink> = {
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
      const exists = await redis.exists(KEYS.socialLink(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Lien social non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.socialLink(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Lien social supprimé",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

