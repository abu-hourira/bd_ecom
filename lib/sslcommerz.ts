// lib/sslcommerz.ts

export interface SSLCommerzInitParams {
  orderNumber: string;
  trackingId: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryZone: string;
  itemCount: number;
}

export async function initiateSSLCommerzPayment(params: SSLCommerzInitParams) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID || "testbox";
  const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty";
  const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const apiUrl = isSandbox
    ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

  const formData = new URLSearchParams();
  formData.append("store_id", storeId);
  formData.append("store_passwd", storePass);
  formData.append("total_amount", params.totalAmount.toString());
  formData.append("currency", "BDT");
  formData.append("tran_id", params.orderNumber);

  // Return URLs
  formData.append("success_url", `${appUrl}/api/payments/sslcommerz/success`);
  formData.append("fail_url", `${appUrl}/api/payments/sslcommerz/fail`);
  formData.append("cancel_url", `${appUrl}/api/payments/sslcommerz/cancel`);
  formData.append("ipn_url", `${appUrl}/api/payments/sslcommerz/ipn`);

  // Customer Information
  formData.append("cus_name", params.customerName);
  formData.append("cus_email", params.customerEmail || "customer@enmar.bd");
  formData.append("cus_add1", params.shippingAddress);
  formData.append("cus_city", params.deliveryZone.includes("Dhaka") ? "Dhaka" : "Bangladesh");
  formData.append("cus_country", "Bangladesh");
  formData.append("cus_phone", params.customerPhone);

  // Shipment & Product Information
  formData.append("shipping_method", "Courier");
  formData.append("num_of_item", params.itemCount.toString());
  formData.append("product_name", "ENMAR Pure Organic Food Products");
  formData.append("product_category", "Organic Food");
  formData.append("product_profile", "physical-goods");

  // Pass trackingId as value_a for easy lookup
  formData.append("value_a", params.trackingId);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json();
  return data;
}

export async function validateSSLCommerzPayment(valId: string) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID || "testbox";
  const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty";
  const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

  const validationUrl = isSandbox
    ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePass}&format=json`
    : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePass}&format=json`;

  const response = await fetch(validationUrl);
  const data = await response.json();
  return data;
}
