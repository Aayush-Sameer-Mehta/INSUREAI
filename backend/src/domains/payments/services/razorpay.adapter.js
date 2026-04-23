import crypto from "crypto";
import axios from "axios";

const PAYMENT_MODE = String(process.env.PAYMENT_PROVIDER_MODE || "auto").toLowerCase();
const RAZORPAY_KEY_ID = String(process.env.RAZORPAY_KEY_ID || "").trim();
const RAZORPAY_KEY_SECRET = String(process.env.RAZORPAY_KEY_SECRET || "").trim();
const RAZORPAY_API_BASE = String(process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1").replace(/\/$/, "");

function canUseRazorpay() {
  if (PAYMENT_MODE === "mock") return false;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return false;
  return true;
}

function toPaise(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error("Invalid payment amount");
  }
  return Math.round(numeric * 100);
}

function signaturesMatch(expected, received) {
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function parseGatewayError(error) {
  const status = Number(error?.response?.status || 0);
  const description = String(
    error?.response?.data?.error?.description ||
    error?.response?.data?.error?.reason ||
    error?.message ||
    "",
  ).trim();
  const lower = description.toLowerCase();

  // Razorpay returns this for invalid credentials or mode/key mismatch.
  if (
    status === 401 ||
    lower.includes("authentication failed") ||
    lower.includes("invalid key") ||
    lower.includes("key id") ||
    lower.includes("not authorized")
  ) {
    return "Razorpay authentication failed. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (same TEST/LIVE pair), then restart backend.";
  }

  return description || "Unable to create Razorpay order.";
}

export function getPaymentGatewayConfig() {
  if (!canUseRazorpay()) {
    return {
      provider: "mock",
      keyId: "",
      mode: PAYMENT_MODE,
    };
  }

  return {
    provider: "razorpay",
    keyId: RAZORPAY_KEY_ID,
    mode: PAYMENT_MODE,
  };
}

export async function createOrder({ amount, currency = "INR", receipt }) {
  const amountInPaise = toPaise(amount);

  if (!canUseRazorpay()) {
    return {
      provider: "mock",
      id: `order_${crypto.randomBytes(8).toString("hex")}`,
      amount: amountInPaise,
      amountInRupees: amountInPaise / 100,
      currency,
      receipt,
      status: "created",
    };
  }

  let response;
  try {
    response = await axios.post(
      `${RAZORPAY_API_BASE}/orders`,
      {
        amount: amountInPaise,
        currency,
        receipt,
        payment_capture: 1,
      },
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET,
        },
        timeout: 10000,
      },
    );
  } catch (error) {
    throw new Error(parseGatewayError(error));
  }

  return {
    provider: "razorpay",
    id: response.data?.id,
    amount: Number(response.data?.amount || amountInPaise),
    amountInRupees: Number(response.data?.amount || amountInPaise) / 100,
    currency: response.data?.currency || currency,
    receipt: response.data?.receipt || receipt,
    status: response.data?.status || "created",
  };
}

export async function verifyPayment({ orderId, paymentId, signature }) {
  if (!canUseRazorpay()) {
    return {
      verified: Boolean(orderId && paymentId),
      provider: "mock",
      reference: paymentId || orderId,
      signature: signature || "",
    };
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest("hex");

  return {
    verified: signaturesMatch(expectedSignature, signature),
    provider: "razorpay",
    reference: paymentId,
    signature,
  };
}
