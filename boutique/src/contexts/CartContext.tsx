import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, CartTotals, Promo } from "@plug-certifie/shared";

interface CartContextType {
  items: CartItem[];
  promoCode: string | null;
  appliedPromo: Promo | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => Promise<boolean>;
  removePromo: () => void;
  getTotals: () => CartTotals;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "plug-certifie-cart";
const PROMO_STORAGE_KEY = "plug-certifie-promo";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
      const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
      if (storedPromo) {
        const promo = JSON.parse(storedPromo);
        setPromoCode(promo.code);
        setAppliedPromo(promo.promo);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const itemId = `${item.productId}-${item.variantName}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, { ...item, id: itemId }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode(null);
    setAppliedPromo(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const applyPromo = async (code: string): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/promos`);
      const data = await response.json();

      if (!data.success || !data.data) {
        return false;
      }

      const promos: Promo[] = data.data;
      const promo = promos.find(
        (p) => p.code.toUpperCase() === code.toUpperCase() && p.enabled
      );

      if (!promo) {
        return false;
      }

      const totals = getTotals();
      if (totals.subtotal < promo.minAmount) {
        return false;
      }

      setPromoCode(code.toUpperCase());
      setAppliedPromo(promo);
      localStorage.setItem(
        PROMO_STORAGE_KEY,
        JSON.stringify({ code: code.toUpperCase(), promo })
      );
      return true;
    } catch (error) {
      console.error("Error applying promo:", error);
      return false;
    }
  };

  const removePromo = () => {
    setPromoCode(null);
    setAppliedPromo(null);
    localStorage.removeItem(PROMO_STORAGE_KEY);
  };

  const getTotals = (): CartTotals => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === "percent") {
        discount = (subtotal * appliedPromo.value) / 100;
      } else {
        discount = appliedPromo.value;
      }
    }

    // Service fee will be added in checkout
    const serviceFee = 0;

    const total = Math.max(0, subtotal - discount + serviceFee);

    return {
      subtotal,
      discount,
      serviceFee,
      total,
    };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        promoCode,
        appliedPromo,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
        getTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

