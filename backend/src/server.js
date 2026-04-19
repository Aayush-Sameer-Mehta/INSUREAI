import "dotenv/config";

import app from "./app.js";
import { connectDB } from "./config/database.js";
import { runRenewalReminderProcessor } from "./domains/notifications/services/reminder.service.js";

const PORT = process.env.PORT || 5001;

await connectDB();
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

setInterval(() => {
  runRenewalReminderProcessor().catch(() => {});
}, 60 * 60 * 1000);
