import crypto from "crypto";

const PAYMENT_MODE = process.env.PAYMENT_PROVIDER_MODE || "mock";

export async function createOrder({ amount, currency = "INR", receipt }) {
  if (PAYMENT_MODE === "mock") {
    return {
      provider: "mock",
      id: `order_${crypto.randomBytes(8).toString("hex")}`,
      amount,
      currency,
      receipt,
      status: "created",
    };
  }

  // Live adapter placeholder for Razorpay integration.
  return {
    provider: "razorpay",
    id: `rzp_order_${crypto.randomBytes(8).toString("hex")}`,
    amount,
    currency,
    receipt,
    status: "created",
  };
}

export async function verifyPayment({ orderId, paymentId, signature }) {
  if (PAYMENT_MODE === "mock") {
    return {
      verified: Boolean(orderId && paymentId),
      provider: "mock",
      reference: paymentId || orderId,
      signature: signature || "",
    };
  }

  // Live adapter placeholder for Razorpay signature verification.
  return {
    verified: Boolean(orderId && paymentId && signature),
    provider: "razorpay",
    reference: paymentId,
    signature,
  };
}

