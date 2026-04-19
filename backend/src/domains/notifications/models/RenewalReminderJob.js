import mongoose from "mongoose";

const renewalReminderJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true,
    },
    purchasedPolicyId: { type: String, required: true, index: true },
    remindOn: { type: Date, required: true, index: true },
    reminderDaysBefore: { type: Number, enum: [30, 7, 1], required: true },
    status: {
      type: String,
      enum: ["Scheduled", "Sent", "Failed"],
      default: "Scheduled",
      index: true,
    },
    sentAt: { type: Date },
    errorMessage: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ── Indexing for Performance ────────────────────────── */
renewalReminderJobSchema.index({ user: 1, status: 1 });
renewalReminderJobSchema.index({ remindOn: 1, is_active: 1 });

export default mongoose.model("RenewalReminderJob", renewalReminderJobSchema);
