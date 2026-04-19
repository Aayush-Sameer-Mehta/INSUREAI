import mongoose from "mongoose";

const auditEventSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    summary: { type: String, default: "" },
    metadata: { type: Object, default: {} },

    /* ── Audit & Compliance Details ──────────────── */
    ip_address: { type: String, default: "" },
    device_info: {
      user_agent: { type: String, default: "" },
      browser: { type: String, default: "" },
      os: { type: String, default: "" },
      device_type: {
        type: String,
        enum: ["Mobile", "Tablet", "Desktop"],
        default: "Desktop",
      },
    },
    geo_location: {
      latitude: { type: Number },
      longitude: { type: Number },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    action_severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
      index: true,
    },
    compliance_flag: { type: Boolean, default: false, index: true },
    is_active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

/* ── Indexing for Performance ────────────────────────── */
auditEventSchema.index({ actor: 1, eventType: 1, createdAt: -1 });
auditEventSchema.index({ entityType: 1, entityId: 1 });
auditEventSchema.index({ is_active: 1, action_severity: 1 });
auditEventSchema.index({ compliance_flag: 1 });

export default mongoose.model("AuditEvent", auditEventSchema);
