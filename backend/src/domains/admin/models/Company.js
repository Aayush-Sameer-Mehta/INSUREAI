import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    /* ── Company Identification ──────────────────────── */
    company_id: { type: String, required: true, unique: true, index: true },
    company_name: { type: String, required: true, trim: true, index: true },
    irdai_registration_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    company_type: {
      type: String,
      enum: ["Life", "General", "Health", "Composite"],
      required: true,
      index: true,
    },

    /* ── Contact Information ─────────────────────────── */
    headquarters: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    contact_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contact_phone: { type: String, required: true, trim: true },
    website_url: { type: String, default: "" },

    /* ── Compliance & Performance Metrics ───────────── */
    claim_settlement_ratio: { type: Number, default: 0, min: 0, max: 100 },
    solvency_ratio: { type: Number, default: 0, min: 0 },
    grievance_contact_details: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    support_channels: [
      {
        channel: {
          type: String,
          enum: ["Email", "Phone", "SMS", "Chat", "WhatsApp", "Website"],
        },
        availability: { type: String, default: "24/7" },
        contact: { type: String, default: "" },
      },
    ],

    /* ── Regulatory & Status ─────────────────────────── */
    license_expiry_date: { type: Date },
    is_active: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
      index: true,
    },

    /* ── Timestamps ──────────────────────────────────── */
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

/* ── Indexing for Performance ────────────────────────── */
companySchema.index({ company_id: 1, irdai_registration_number: 1 });
companySchema.index({ is_active: 1, status: 1 });

export default mongoose.model("Company", companySchema);
