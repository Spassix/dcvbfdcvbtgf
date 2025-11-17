import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, AdminUser, AdminRole } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const adminUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  role: z.enum(["admin", "superadmin"]),
});

export const adminUsersController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const userIds = await keys("admin:user:*");
      const users: Omit<AdminUser, "password">[] = [];

      for (const key of userIds) {
        const user = await redis.get<AdminUser>(key);
        if (user) {
          // Never send password hash
          const { id, email, role, createdAt, updatedAt } = user;
          users.push({ id, email, role, createdAt, updatedAt });
        }
      }

      const response: ApiResponse<Omit<AdminUser, "password">[]> = {
        success: true,
        data: users,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = adminUserSchema.parse(req.body);

      if (!body.password) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Mot de passe requis",
        };
        res.status(400).json(response);
        return;
      }

      // Check if email already exists
      const userIds = await keys("admin:user:*");
      for (const key of userIds) {
        const user = await redis.get<AdminUser>(key);
        if (user && user.email === body.email) {
          const response: ApiResponse<never> = {
            success: false,
            error: "Cet email est déjà utilisé",
          };
          res.status(400).json(response);
          return;
        }
      }

      const id = uuidv4();
      const passwordHash = await bcrypt.hash(body.password, 10);

      const user: AdminUser = {
        id,
        email: body.email,
        role: body.role,
        createdAt: new Date().toISOString(),
      };

      // Store user and password separately
      await redis.set(KEYS.adminUser(id), user);
      await redis.set(`admin:password:${id}`, passwordHash);

      const response: ApiResponse<Omit<AdminUser, "password">> = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
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
      const body = adminUserSchema.partial().parse(req.body);

      const existing = await redis.get<AdminUser>(KEYS.adminUser(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Utilisateur non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      // Check email uniqueness if email is being changed
      if (body.email && body.email !== existing.email) {
        const userIds = await keys("admin:user:*");
        for (const key of userIds) {
          const user = await redis.get<AdminUser>(key);
          if (user && user.email === body.email) {
            const response: ApiResponse<never> = {
              success: false,
              error: "Cet email est déjà utilisé",
            };
            res.status(400).json(response);
            return;
          }
        }
      }

      const updated: AdminUser = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.adminUser(id), updated);

      // Update password if provided
      if (body.password) {
        const passwordHash = await bcrypt.hash(body.password, 10);
        await redis.set(`admin:password:${id}`, passwordHash);
      }

      const response: ApiResponse<Omit<AdminUser, "password">> = {
        success: true,
        data: {
          id: updated.id,
          email: updated.email,
          role: updated.role,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
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
      const exists = await redis.exists(KEYS.adminUser(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Utilisateur non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.adminUser(id));
      await redis.del(`admin:password:${id}`);

      const response: ApiResponse<never> = {
        success: true,
        message: "Utilisateur supprimé",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

