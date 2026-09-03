export interface DeliveryDiscountTier {
  minQty: number;
  discountAmount: number;
  discountType?: "FIXED" | "FREE_SHIPPING";
}

export interface DeliveryCalculationParams {
  items: Array<{
    name?: string;
    quantity: number;
    weightInGrams?: number | null;
    unit?: string;
    unitQuantity?: number | string | null;
    price?: number;
    deliveryDiscountMinQty?: number | null;
    deliveryDiscountAmount?: number | null;
    deliveryDiscountType?: string | null;
    deliveryDiscountTiers?: DeliveryDiscountTier[] | string | null;
  }>;
  subtotal: number;
  hasFreeShippingPromo?: boolean;
  baseDeliveryFee?: number; // default 100
  baseWeightKg?: number; // default 1.0
  perExtraKgFee?: number; // default 20
  freeShippingThreshold?: number; // default 1500 (0 means disabled)
}

export interface DeliveryCalculationResult {
  totalWeightGrams: number;
  totalWeightKg: number;
  baseDeliveryFee: number;
  extraWeightKg: number;
  extraKgCount: number;
  extraFee: number;
  rawDeliveryFee: number;
  productDeliveryDiscount: number;
  discountedProductNames: string[];
  finalDeliveryFee: number;
  isFreeShipping: boolean;
  freeShippingReason?: string;
  breakdownText: string;
}

/**
 * Calculates weight-based delivery fees accurately with multi-tiered product-level quantity/weight delivery discounts.
 * Rule: Base delivery fee (e.g. ৳100) covers up to 1.0 KG.
 * Any weight above 1.0 KG is charged per additional KG (e.g. +৳20/kg).
 * Supports multiple discount tiers per product (e.g. 2+ pcs -> ৳20 off, 5+ pcs -> ৳50 off, 10+ pcs -> ৳100 off).
 */
export function calculateDeliveryFee(params: DeliveryCalculationParams): DeliveryCalculationResult {
  const baseFee = params.baseDeliveryFee !== undefined ? Number(params.baseDeliveryFee) : 100;
  const baseWeightKg = params.baseWeightKg !== undefined ? Number(params.baseWeightKg) : 1.0;
  const perExtraKg = params.perExtraKgFee !== undefined ? Number(params.perExtraKgFee) : 20;
  const freeThreshold =
    params.freeShippingThreshold !== undefined ? Number(params.freeShippingThreshold) : 1500;

  // 1. Calculate total weight in grams and check multi-tier product-specific delivery discounts
  let totalGrams = 0;
  let totalProductDeliveryDiscount = 0;
  const discountedProductNames: string[] = [];
  let hasFreeShippingProduct = false;

  if (Array.isArray(params.items)) {
    for (const item of params.items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let itemWeight = item.weightInGrams;
      if (itemWeight === undefined || itemWeight === null || isNaN(itemWeight) || itemWeight <= 0) {
        // Fallback inference based on unit string
        const unitStr = (item.unit || "").toLowerCase();
        if (unitStr.includes("kg")) {
          itemWeight = Math.round(Number(item.unitQuantity || 1) * 1000);
        } else if (unitStr.includes("g") && !unitStr.includes("kg")) {
          itemWeight = Math.round(Number(item.unitQuantity || 500));
        } else if (unitStr.includes("l")) {
          itemWeight = Math.round(Number(item.unitQuantity || 1) * 1000);
        } else if (unitStr.includes("ml")) {
          itemWeight = Math.round(Number(item.unitQuantity || 500));
        } else {
          itemWeight = 100; // 100g per piece
        }
      }
      totalGrams += itemWeight * qty;

      // Parse all configured discount tiers for this product
      let tiers: DeliveryDiscountTier[] = [];
      if (Array.isArray(item.deliveryDiscountTiers)) {
        tiers = item.deliveryDiscountTiers;
      } else if (typeof item.deliveryDiscountTiers === "string") {
        try {
          const parsed = JSON.parse(item.deliveryDiscountTiers);
          if (Array.isArray(parsed)) tiers = parsed;
        } catch (e) {}
      }

      // Add legacy single tier fallback if tiers array is empty
      const legacyMin = Number(item.deliveryDiscountMinQty) || 0;
      const legacyAmt = Number(item.deliveryDiscountAmount) || 0;
      if (tiers.length === 0 && legacyMin > 0 && legacyAmt > 0) {
        tiers.push({
          minQty: legacyMin,
          discountAmount: legacyAmt,
          discountType: (item.deliveryDiscountType as any) || "FIXED",
        });
      }

      // Find all qualifying tiers for current quantity (sorted best discount first)
      const qualifyingTiers = tiers
        .filter((t) => Number(t.minQty) > 0 && qty >= Number(t.minQty))
        .sort((a, b) => {
          if (a.discountType === "FREE_SHIPPING") return -1;
          if (b.discountType === "FREE_SHIPPING") return 1;
          return Number(b.discountAmount || 0) - Number(a.discountAmount || 0);
        });

      if (qualifyingTiers.length > 0) {
        const bestTier = qualifyingTiers[0];
        const tierAmt = Number(bestTier.discountAmount) || 0;
        if (bestTier.discountType === "FREE_SHIPPING") {
          hasFreeShippingProduct = true;
          if (item.name && !discountedProductNames.includes(item.name)) {
            discountedProductNames.push(item.name);
          }
        } else if (tierAmt > 0) {
          totalProductDeliveryDiscount += tierAmt;
          if (item.name && !discountedProductNames.includes(item.name)) {
            discountedProductNames.push(item.name);
          }
        }
      }
    }
  }

  const totalKg = Number((totalGrams / 1000).toFixed(2));

  // 2. Extra weight calculation
  const extraWeightKg = Math.max(0, Number((totalKg - baseWeightKg).toFixed(2)));
  const extraKgCount = extraWeightKg > 0 ? Math.ceil(extraWeightKg) : 0;
  const extraFee = extraKgCount * perExtraKg;
  const rawDeliveryFee = baseFee + extraFee;

  // 3. Free shipping & discount resolution
  let isFreeShipping = false;
  let freeShippingReason = "";
  let finalDeliveryFee = rawDeliveryFee;

  if (params.hasFreeShippingPromo) {
    isFreeShipping = true;
    freeShippingReason = "প্রোমো কোড ডিসকাউন্ট";
    finalDeliveryFee = 0;
  } else if (freeThreshold > 0 && params.subtotal >= freeThreshold) {
    isFreeShipping = true;
    freeShippingReason = `৳${freeThreshold} বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি`;
    finalDeliveryFee = 0;
  } else if (hasFreeShippingProduct) {
    isFreeShipping = true;
    freeShippingReason = `${discountedProductNames.join(", ")} স্পেশাল ফ্রি ডেলিভারি`;
    finalDeliveryFee = 0;
  } else {
    // Apply product delivery discounts strictly as subtraction
    const appliedDiscount = Math.min(rawDeliveryFee, totalProductDeliveryDiscount);
    finalDeliveryFee = Math.max(0, rawDeliveryFee - appliedDiscount);
    if (finalDeliveryFee === 0 && totalProductDeliveryDiscount > 0) {
      isFreeShipping = true;
      freeShippingReason = "প্রোডাক্ট ডেলিভারি ছাড়";
    }
  }

  // 4. Readable Bengali breakdown text
  let breakdownText = "";
  if (isFreeShipping) {
    breakdownText = `ফ্রি ডেলিভারি (${freeShippingReason})`;
  } else if (totalProductDeliveryDiscount > 0) {
    breakdownText = `৳${finalDeliveryFee} (মোট: ৳${rawDeliveryFee} - ৳${totalProductDeliveryDiscount} প্রোডাক্ট ডেলিভারি ছাড়)`;
  } else if (extraKgCount > 0) {
    breakdownText = `৳${finalDeliveryFee} (বেস ১ কেজি: ৳${baseFee} + অতিরিক্ত ${extraKgCount} কেজি: ৳${extraFee})`;
  } else {
    breakdownText = `৳${finalDeliveryFee} (১ কেজি পর্যন্ত বেস চার্জ)`;
  }

  return {
    totalWeightGrams: totalGrams,
    totalWeightKg: totalKg,
    baseDeliveryFee: baseFee,
    extraWeightKg,
    extraKgCount,
    extraFee,
    rawDeliveryFee,
    productDeliveryDiscount: totalProductDeliveryDiscount,
    discountedProductNames,
    finalDeliveryFee,
    isFreeShipping,
    freeShippingReason,
    breakdownText,
  };
}
