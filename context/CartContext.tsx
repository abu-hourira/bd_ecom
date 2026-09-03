"use client";
// context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { formatProductUnit } from "@/lib/utils";
import { calculateDeliveryFee, DeliveryCalculationResult } from "@/lib/delivery-calculator";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  unit: string;
  unitQuantity?: number | string | null;
  weightInGrams?: number | null;
  deliveryDiscountMinQty?: number | null;
  deliveryDiscountAmount?: number | null;
  deliveryDiscountType?: string | null;
  deliveryDiscountTiers?: any;
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
  flatDeliveryFee: number;
  deliveryBaseFee: number;
  deliveryPerExtraKg: number;
  amountNeededForFreeShipping: number;
  hasFreeShipping: boolean;
  totalCartWeightKg: number;
  deliveryFee: number;
  deliveryBreakdownText: string;
  deliveryResult: DeliveryCalculationResult;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [flatDeliveryFee, setFlatDeliveryFee] = useState(100);
  const [deliveryBaseFee, setDeliveryBaseFee] = useState(100);
  const [deliveryPerExtraKg, setDeliveryPerExtraKg] = useState(20);
  const [deliveryBaseWeightKg, setDeliveryBaseWeightKg] = useState(1.0);

  // Fetch live settings from database
  const fetchLiveSettings = async () => {
    try {
      const res = await fetch("/api/storefront/settings", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.settings) {
        if (data.settings.freeShippingThreshold || data.settings.delivery_free_shipping_threshold) {
          const parsed = Number(
            data.settings.delivery_free_shipping_threshold || data.settings.freeShippingThreshold
          );
          if (!isNaN(parsed) && parsed > 0) setFreeShippingThreshold(parsed);
        }
        if (data.settings.delivery_base_fee || data.settings.shippingFlat) {
          const parsedFee = Number(data.settings.delivery_base_fee || data.settings.shippingFlat);
          if (!isNaN(parsedFee) && parsedFee >= 0) {
            setFlatDeliveryFee(parsedFee);
            setDeliveryBaseFee(parsedFee);
          }
        }
        if (data.settings.delivery_per_extra_kg) {
          const parsedExtra = Number(data.settings.delivery_per_extra_kg);
          if (!isNaN(parsedExtra) && parsedExtra >= 0) setDeliveryPerExtraKg(parsedExtra);
        }
        if (data.settings.delivery_base_weight_kg) {
          const parsedBaseKg = Number(data.settings.delivery_base_weight_kg);
          if (!isNaN(parsedBaseKg) && parsedBaseKg > 0) setDeliveryBaseWeightKg(parsedBaseKg);
        }
      }
    } catch (e) {}
  };

  // Initial load and real-time interval pulse
  useEffect(() => {
    fetchLiveSettings();

    // Auto sync on window focus and visibility change (instant when switching back to tab)
    const handleFocus = () => fetchLiveSettings();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // Background interval pulse every 8 seconds
    const interval = setInterval(fetchLiveSettings, 8000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Multi-tab real-time storage sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "enmar_cart_v1" && e.newValue) {
        try {
          setCart(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
            unit: formatProductUnit(product.unitQuantity, product.unit),
            unitQuantity: product.unitQuantity || null,
            weightInGrams: product.weightInGrams !== undefined && product.weightInGrams !== null ? Number(product.weightInGrams) : null,
            deliveryDiscountMinQty: product.deliveryDiscountMinQty ? Number(product.deliveryDiscountMinQty) : null,
            deliveryDiscountAmount: product.deliveryDiscountAmount ? Number(product.deliveryDiscountAmount) : null,
            deliveryDiscountType: product.deliveryDiscountType || "FIXED",
            deliveryDiscountTiers: product.deliveryDiscountTiers || null,
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

  const deliveryResult = calculateDeliveryFee({
    items: cart,
    subtotal: cartSubtotal,
    baseDeliveryFee: deliveryBaseFee,
    baseWeightKg: deliveryBaseWeightKg,
    perExtraKgFee: deliveryPerExtraKg,
    freeShippingThreshold: freeShippingThreshold,
  });

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const hasFreeShipping = deliveryResult.isFreeShipping;
  const totalCartWeightKg = deliveryResult.totalWeightKg;
  const deliveryFee = deliveryResult.finalDeliveryFee;
  const deliveryBreakdownText = deliveryResult.breakdownText;

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
        flatDeliveryFee,
        deliveryBaseFee,
        deliveryPerExtraKg,
        amountNeededForFreeShipping,
        hasFreeShipping,
        totalCartWeightKg,
        deliveryFee,
        deliveryBreakdownText,
        deliveryResult,
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
