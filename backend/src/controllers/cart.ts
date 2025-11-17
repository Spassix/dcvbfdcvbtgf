import { Request, Response } from "express";
import { z } from "zod";
import { redis, KEYS } from "../db/redis";
import { ApiResponse, CartSettings, CartService, PaymentMethod, ContactLink, TimeSlot } from "@plug-certifie/shared";
import { v4 as uuidv4 } from "uuid";

const timeSlotSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const cartServiceSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  fee: z.number().min(0),
  enabled: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
});

const paymentMethodSchema = z.object({
  label: z.string().min(1),
  enabled: z.boolean(),
});

const contactLinkSchema = z.object({
  name: z.string().min(1),
  icon: z.string().min(1),
  url: z.string().url(),
  services: z.array(z.string()).optional(),
});

const cartSettingsSchema = z.object({
  services: z.array(cartServiceSchema).optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
  promoEnabled: z.boolean().optional(),
  alertMessage: z.object({
    text: z.string(),
    enabled: z.boolean(),
  }).optional(),
  contactLinks: z.array(contactLinkSchema).optional(),
  buttonColors: z.object({
    continue: z.string(),
    back: z.string(),
    promo: z.string(),
    copy: z.string(),
    clearCart: z.string(),
    selectedSlot: z.string(),
    unselectedSlot: z.string(),
    selectedPayment: z.string(),
    unselectedPayment: z.string(),
  }).optional(),
});

export const cartController = {
  async getServices(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await redis.get<CartSettings>(KEYS.cartSettings);
      const services = settings?.services?.filter(s => s.enabled) || [];

      const response: ApiResponse<CartService[]> = {
        success: true,
        data: services,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async getSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await redis.get<CartSettings>(KEYS.cartSettings) || {
        services: [],
        paymentMethods: [],
        promoEnabled: true,
        contactLinks: [],
        buttonColors: {
          continue: "#000000",
          back: "#666666",
          promo: "#000000",
          copy: "#000000",
          clearCart: "#ff0000",
          selectedSlot: "#000000",
          unselectedSlot: "#cccccc",
          selectedPayment: "#000000",
          unselectedPayment: "#cccccc",
        },
      };

      const response: ApiResponse<CartSettings> = {
        success: true,
        data: settings,
      };

      res.json(response);
    } catch (error) {
      throw error;
    }
  },

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const body = cartSettingsSchema.parse(req.body);
      const existing = await redis.get<CartSettings>(KEYS.cartSettings) || {
        services: [],
        paymentMethods: [],
        promoEnabled: true,
        contactLinks: [],
        buttonColors: {
          continue: "#000000",
          back: "#666666",
          promo: "#000000",
          copy: "#000000",
          clearCart: "#ff0000",
          selectedSlot: "#000000",
          unselectedSlot: "#cccccc",
          selectedPayment: "#000000",
          unselectedPayment: "#cccccc",
        },
      };

      const updated: CartSettings = {
        ...existing,
        ...body,
        services: body.services || existing.services,
        paymentMethods: body.paymentMethods || existing.paymentMethods,
        contactLinks: body.contactLinks || existing.contactLinks,
        buttonColors: body.buttonColors || existing.buttonColors,
      };

      await redis.set(KEYS.cartSettings, updated);

      const response: ApiResponse<CartSettings> = {
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
};

