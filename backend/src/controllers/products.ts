import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS, keys } from "../db/redis";
import { ApiResponse, Product, ProductVariant } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const productVariantSchema = z.object({
  name: z.string().min(1),
  grammage: z.number().positive(),
  unit: z.string().min(1),
  price: z.number().positive(),
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  category: z.string().min(1),
  farm: z.string().min(1),
  photo: z.string().optional(),
  image: z.string().optional(),
  video: z.string().optional(),
  medias: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).min(1),
});

export const productsController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const productIds = await keys("product:*");
      const products: Product[] = [];

      for (const key of productIds) {
        const product = await redis.get<Product>(key);
        if (product) {
          products.push(product);
        }
      }

      const response: ApiResponse<Product[]> = {
        success: true,
        data: products,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await redis.get<Product>(KEYS.product(id));

      if (!product) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Produit non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Product> = {
        success: true,
        data: product,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = productSchema.parse(req.body);
      const id = uuidv4();

      const product: Product = {
        id,
        name: body.name,
        description: body.description,
        category: body.category,
        farm: body.farm,
        photo: body.photo,
        image: body.image,
        video: body.video,
        medias: body.medias,
        variants: body.variants,
        createdAt: new Date().toISOString(),
      };

      await redis.set(KEYS.product(id), product);

      const response: ApiResponse<Product> = {
        success: true,
        data: product,
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
      const body = productSchema.partial().parse(req.body);

      const existing = await redis.get<Product>(KEYS.product(id));
      if (!existing) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Produit non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      const updated: Product = {
        ...existing,
        ...body,
        updatedAt: new Date().toISOString(),
      };

      await redis.set(KEYS.product(id), updated);

      const response: ApiResponse<Product> = {
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
      const exists = await redis.exists(KEYS.product(id));

      if (!exists) {
        const response: ApiResponse<never> = {
          success: false,
          error: "Produit non trouvé",
        };
        res.status(404).json(response);
        return;
      }

      await redis.del(KEYS.product(id));

      const response: ApiResponse<never> = {
        success: true,
        message: "Produit supprimé",
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },
};

