import mongoose from "mongoose";

const customerSupportSchema = new mongoose.Schema(
  {
    /* ── Ticket Identification ───────────────────────── */
    ticket_id: { type: String, required: true, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ── Issue Details ───────────────────────────────── */
    issue_type: {
      type: String,
      enum: [
        "Claim Related",
        "Policy Query",
        "Payment Issue",
        "Document Upload",
        "Premium Payment",
        "Renewal",
        "Grievance",
        "General Inquiry",
        "Technical Issue",
        "Other",
      ],
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    related_policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" },
    related_claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim" },

    /* ── Priority & Assignment ───────────────────────── */
    priority_level: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    assigned_agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assigned_at: { type: Date },

    /* ── Communication ───────────────────────────────── */
    communication_channel: {
      type: String,
      enum: ["Email", "Phone", "Chat", "WhatsApp", "Portal"],
      default: "Portal",
    },
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        sender_type: {
          type: String,
          enum: ["Customer", "Agent", "Admin"],
          default: "Customer",
        },
        message: { type: String, required: true },
        attachments: [{ type: String }],
        sent_at: { type: Date, default: Date.now },
      },
    ],

    /* ── Resolution Details ──────────────────────────── */
    resolution_status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Pending",
        "Resolved",
        "Closed",
        "Escalated",
      ],
      default: "Open",
      index: true,
    },
    resolution_notes: { type: String, default: "" },
    resolved_at: { type: Date },
    resolution_time_hours: { type: Number },

    /* ── Feedback ────────────────────────────────────── */
    customer_satisfaction_rating: { type: Number, min: 1, max: 5 },
    feedback_comments: { type: String, default: "" },
    feedback_provided_at: { type: Date },

    /* ── Status & Timestamps ────────────────────────── */
    is_active: { type: Boolean, default: true, index: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

/* ── Auto-generate Ticket ID ─────────────────────────── */
customerSupportSchema.pre("validate", function (next) {
  if (!this.ticket_id) {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.ticket_id = `TKT-${stamp}-${random}`;
  }
  next();
});

/* ── Indexing for Performance ────────────────────────── */
customerSupportSchema.index({ ticket_id: 1 });
customerSupportSchema.index({ user: 1, created_at: -1 });
customerSupportSchema.index({ is_active: 1, resolution_status: 1 });
customerSupportSchema.index({ assigned_agent: 1, resolution_status: 1 });
customerSupportSchema.index({ priority_level: 1, created_at: -1 });

export default mongoose.model("CustomerSupport", customerSupportSchema);
