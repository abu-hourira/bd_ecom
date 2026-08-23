// context/CartContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  unit: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  hasFreeShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const freeShippingThreshold = 1500; // Free delivery over ৳1500

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("enmar_cart_v1");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("[CartContext] Error loading cart:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("enmar_cart_v1", JSON.stringify(cart));
    } catch (e) {
      console.error("[CartContext] Error saving cart:", e);
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any, quantity = 1) => {
    const effectivePrice = Number(product.discountPrice || product.price);
    const imageSrc =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "/assets/products/placeholder.jpg";

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: effectivePrice,
            discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
            unit: product.unit || "piece",
            image: imageSrc,
            quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const hasFreeShipping = cartSubtotal >= freeShippingThreshold;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        hasFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
