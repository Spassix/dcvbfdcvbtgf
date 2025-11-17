// Product types
export interface ProductVariant {
  name: string; // e.g. "1g"
  grammage: number;
  unit: string; // e.g. "g", "ml"
  price: number; // in euros
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string; // category id
  farm: string; // farm id
  photo?: string;
  image?: string;
  video?: string;
  medias?: string[];
  variants: ProductVariant[];
  createdAt: string; // ISO date
  updatedAt?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  icon: string; // emoji or image URL
  createdAt?: string;
  updatedAt?: string;
}

// Farm types
export interface Farm {
  id: string;
  name: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Promo types
export type PromoType = "percent" | "fixed";

export interface Promo {
  id: string;
  code: string;
  type: PromoType;
  value: number;
  minAmount: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Review types
export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cart types
export interface CartItem {
  id: string; // unique item id (productId-variantName)
  productId: string;
  variantName: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  image?: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
}

// Service types
export interface TimeSlot {
  label: string; // e.g. "18h-20h"
  value: string;
}

export interface CartService {
  id: string;
  name: string;
  label: string;
  description: string;
  fee: number;
  enabled: boolean;
  timeSlots: TimeSlot[];
  createdAt?: string;
  updatedAt?: string;
}

// Payment method types
export interface PaymentMethod {
  id: string;
  label: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Settings types
export interface HomeSection {
  icon: string; // emoji or URL
  title: string;
  content: string;
}

export interface ShopSettings {
  shopName: string;
  heroTitle: string;
  heroSubtitle: string;
  backgroundImage?: string;
  sections: HomeSection[];
}

// Theme types
export interface ColorTheme {
  textPrimary: string;
  textSecondary: string;
  textHeading: string;
  backgroundColor: string;
  cardBackground: string;
  borderColor: string;
  buttonText: string;
  buttonBackground: string;
  linkColor: string;
  accentColor: string;
}

export interface EventTheme {
  id: string;
  name: string;
  enabled: boolean;
  startDate: string; // ISO
  endDate: string; // ISO
  priority: number;
  config?: Record<string, unknown>;
}

// Typography types
export interface TypographySettings {
  titleFont: string;
  subtitleFont: string;
  bodyFont: string;
}

// Loading screen types
export interface LoadingScreenSettings {
  text: string;
  animationStyle: string;
  logo?: string;
}

// Social link types
export interface SocialLink {
  id: string;
  name: string;
  icon: string; // emoji or URL
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

// Contact link types
export interface ContactLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  services?: string[]; // related service IDs
}

// Cart settings types
export interface CartSettings {
  services: CartService[];
  paymentMethods: PaymentMethod[];
  promoEnabled: boolean;
  alertMessage?: {
    text: string;
    enabled: boolean;
  };
  contactLinks: ContactLink[];
  buttonColors: {
    continue: string;
    back: string;
    promo: string;
    copy: string;
    clearCart: string;
    selectedSlot: string;
    unselectedSlot: string;
    selectedPayment: string;
    unselectedPayment: string;
  };
}

// Admin user types
export type AdminRole = "admin" | "superadmin";

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  createdAt?: string;
  updatedAt?: string;
  // password hash never sent to client
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: AdminRole;
  };
}

// Order types (for checkout summary)
export interface OrderSummary {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
    addressComplement?: string;
  };
  service: {
    name: string;
    timeSlot: string;
    fee: number;
  };
  paymentMethod: string;
  items: CartItem[];
  totals: CartTotals;
  promoCode?: string;
}

