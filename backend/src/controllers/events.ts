import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, EventTheme } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const eventThemeSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  priority: z.number().int(),
  config: z.record(z.unknown()).optional(),
});

export const eventsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const eventIds = await keys("theme:event:*");
      const events: EventTheme[] = [];

      for (const key of eventIds) {
        const event = await redis.get<EventTheme>(key);
        if (event) {
          events.push(event);
        }
      }

      const response: ApiResponse<EventTheme[]> = {
        success: true,
        data: events,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = eventThemeSchema.parse(req.body);
      const id = uuidv4();

      const event: EventTheme = {
        id,
        name: body.name,
        enabled: body.enabled,
        startDate: body.startDate,
        endDate: body.endDate,
        priority: body.priority,
        config: body.config,
      };

      await redis.set(KEYS.eventTheme(id), event);

      const response: ApiResponse<EventTheme> = {
        success: true,
        data: event,
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
      const body = eventThemeSchema.partial().parse(req.body);

      const existing = await redis.get<EventTheme>(KEYS.eventTheme(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Événement non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      const updated: EventTheme = {
        ...existing,
        ...body,
      };

      await redis.set(KEYS.eventTheme(id), updated);

      const response: ApiResponse<EventTheme> = {
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
      const exists = await redis.exists(KEYS.eventTheme(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Événement non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.eventTheme(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Événement supprimé",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

