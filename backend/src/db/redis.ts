import { Redis } from "@upstash/redis";
import { config } from "../config";

export const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

// Helper functions for common operations
export async function get<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value as T | null;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

export async function set(key: string, value: unknown, ttl?: number): Promise<boolean> {
  try {
    if (ttl) {
      await redis.set(key, value, { ex: ttl });
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
    return false;
  }
}

export async function del(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error);
    return false;
  }
}

export async function exists(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error(`Redis EXISTS error for key ${key}:`, error);
    return false;
  }
}

export async function keys(pattern: string): Promise<string[]> {
  try {
    // Upstash Redis uses SCAN instead of KEYS for patterns
    // For now, we'll use a workaround with specific key patterns
    const result = await redis.keys(pattern);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error(`Redis KEYS error for pattern ${pattern}:`, error);
    return [];
  }
}

// Redis key prefixes
export const KEYS = {
  product: (id: string) => `product:${id}`,
  products: "products:all",
  category: (id: string) => `category:${id}`,
  categories: "categories:all",
  farm: (id: string) => `farm:${id}`,
  farms: "farms:all",
  promo: (id: string) => `promo:${id}`,
  promos: "promos:all",
  review: (id: string) => `review:${id}`,
  reviews: "reviews:all",
  settings: (key: string) => `settings:${key}`,
  adminUser: (id: string) => `admin:user:${id}`,
  adminUsers: "admin:users:all",
  cartSettings: "cart:settings",
  colorTheme: "theme:colors",
  eventTheme: (id: string) => `theme:event:${id}`,
  eventThemes: "theme:events:all",
  apiToken: (id: string) => `api:token:${id}`,
  apiTokens: "api:tokens:all",
  typography: "theme:typography",
  loadingScreen: "theme:loading",
  socialLink: (id: string) => `social:${id}`,
  socialLinks: "socials:all",
} as const;

