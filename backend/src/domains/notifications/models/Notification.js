import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "purchase",
        "claim",
        "payment",
        "renewal",
        "system",
        "alert",
        "offer",
      ],
      default: "system",
      index: true,
    },
    notification_type: {
      type: String,
      enum: [
        "purchase",
        "claim",
        "payment",
        "renewal",
        "system",
        "alert",
        "offer",
      ],
      default: "system",
    },
    channelsSent: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    readAt: { type: Date },

    /* ── Renewal & Notification Status ───────────── */
    renewal_offer_generated: { type: Boolean, default: false },
    auto_renewal_flag: { type: Boolean, default: false },
    renewal_discount: { type: Number, default: 0, min: 0 },
    lapse_warning_sent: { type: Boolean, default: false },
    notification_status: {
      type: String,
      enum: ["Scheduled", "Sent", "Failed", "Pending", "Archived"],
      default: "Scheduled",
      index: true,
    },

    /* ── Status & Timestamps ─────────────────────── */
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ── Indexing for Performance ────────────────────────── */
notificationSchema.index({ user: 1, notification_status: 1, createdAt: -1 });
notificationSchema.index({ is_active: 1, type: 1 });
notificationSchema.index({ renewal_offer_generated: 1, auto_renewal_flag: 1 });

export default mongoose.model("Notification", notificationSchema);
