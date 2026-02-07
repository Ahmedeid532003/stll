"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem } from "@/lib/types";

const CART_STORAGE_KEY = "stella_cart";

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (item: CartItem | CartItem[]) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addToCart = useCallback((item: CartItem | CartItem[]) => {
    const toAdd = Array.isArray(item) ? item : [item];
    setItems((prev) => [...prev, ...toAdd]);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQty = useCallback((index: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, quantity: qty } : it))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((s, it) => s + it.quantity, 0);
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
