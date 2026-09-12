import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/database.js";
import { runRenewalReminderProcessor } from "./domains/notifications/services/reminder.service.js";

const PORT = 3000;
const HOST = "0.0.0.0";

function maskKeyId(value = "") {
  if (!value) return "(not set)";
  const raw = String(value).trim();
  if (raw.length <= 8) return raw;
  return `${raw.slice(0, 8)}...${raw.slice(-4)}`;
}

await connectDB();
app.listen(PORT, HOST, () => console.log(`🚀 InsureAI Server running on http://${HOST}:${PORT}`));

const paymentMode = String(process.env.PAYMENT_PROVIDER_MODE || "auto").toLowerCase();
console.log(`💳 Payment mode: ${paymentMode}`);
if (paymentMode !== "mock") {
  console.log(`💳 Razorpay key: ${maskKeyId(process.env.RAZORPAY_KEY_ID)}`);
}

setInterval(() => {
  runRenewalReminderProcessor().catch(() => {});
}, 60 * 60 * 1000);
