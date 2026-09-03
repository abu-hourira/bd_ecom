// lib/delivery-calculator.ts

export interface DeliveryCalculationParams {
  items: Array<{
    quantity: number;
    weightInGrams?: number | null;
    unit?: string;
    unitQuantity?: number | string | null;
    price?: number;
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
  finalDeliveryFee: number;
  isFreeShipping: boolean;
  freeShippingReason?: string;
  breakdownText: string;
}

/**
 * Calculates weight-based delivery fees accurately.
 * Rule: Base delivery fee (e.g. ৳100) covers up to 1.0 KG.
 * Any weight above 1.0 KG is charged per additional KG (e.g. +৳20/kg).
 */
export function calculateDeliveryFee(params: DeliveryCalculationParams): DeliveryCalculationResult {
  const baseFee = params.baseDeliveryFee !== undefined ? Number(params.baseDeliveryFee) : 100;
  const baseWeightKg = params.baseWeightKg !== undefined ? Number(params.baseWeightKg) : 1.0;
  const perExtraKg = params.perExtraKgFee !== undefined ? Number(params.perExtraKgFee) : 20;
  const freeThreshold =
    params.freeShippingThreshold !== undefined ? Number(params.freeShippingThreshold) : 1500;

  // 1. Calculate total weight in grams
  let totalGrams = 0;
  if (Array.isArray(params.items)) {
    for (const item of params.items) {
      const qty = Math.max(1, Number(item.quantity) || 1);
      let itemWeight = item.weightInGrams;
      if (itemWeight === undefined || itemWeight === null || isNaN(itemWeight) || itemWeight <= 0) {
        // Fallback inference based on unit
        if (item.unit === "kg") {
          itemWeight = Math.round(Number(item.unitQuantity || 1) * 1000);
        } else if (item.unit === "g") {
          itemWeight = Math.round(Number(item.unitQuantity || 500));
        } else if (item.unit === "L") {
          itemWeight = Math.round(Number(item.unitQuantity || 1) * 1000);
        } else if (item.unit === "ml") {
          itemWeight = Math.round(Number(item.unitQuantity || 500));
        } else {
          itemWeight = 100; // 100g per piece
        }
      }
      totalGrams += itemWeight * qty;
    }
  }

  const totalKg = Number((totalGrams / 1000).toFixed(2));

  // 2. Extra weight calculation
  const extraWeightKg = Math.max(0, Number((totalKg - baseWeightKg).toFixed(2)));
  const extraKgCount = extraWeightKg > 0 ? Math.ceil(extraWeightKg) : 0;
  const extraFee = extraKgCount * perExtraKg;
  const rawDeliveryFee = baseFee + extraFee;

  // 3. Free shipping checks
  let isFreeShipping = false;
  let freeShippingReason = "";

  if (params.hasFreeShippingPromo) {
    isFreeShipping = true;
    freeShippingReason = "প্রোমো কোড ডিসকাউন্ট";
  } else if (freeThreshold > 0 && params.subtotal >= freeThreshold) {
    isFreeShipping = true;
    freeShippingReason = `৳${freeThreshold} বা তদূর্ধ্ব অর্ডারে ফ্রি ডেলিভারি`;
  }

  const finalDeliveryFee = isFreeShipping ? 0 : rawDeliveryFee;

  // 4. Readable Bengali breakdown text
  let breakdownText = "";
  if (isFreeShipping) {
    breakdownText = `ফ্রি ডেলিভারি (${freeShippingReason})`;
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
    finalDeliveryFee,
    isFreeShipping,
    freeShippingReason,
    breakdownText,
  };
}
