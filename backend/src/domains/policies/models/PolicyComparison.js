import mongoose from "mongoose";

const policyComparisonSchema = new mongoose.Schema(
  {
    /* ── Comparison Identification ───────────────────── */
    comparison_id: { type: String, required: true, unique: true, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ── Policies Being Compared ─────────────────────── */
    compared_policies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Policy",
        required: true,
      },
    ],
    policy_count: { type: Number, default: 0 },

    /* ── Comparison Metrics ──────────────────────────── */
    comparison_metrics: {
      price_comparison: {
        minimum: { type: Number, default: 0 },
        maximum: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
      },
      coverage_comparison: {
        minimum: { type: Number, default: 0 },
        maximum: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
      },
      rating_comparison: {
        minimum: { type: Number, default: 0 },
        maximum: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
      },
      claim_settlement_comparison: {
        minimum: { type: Number, default: 0 },
        maximum: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
      },
      custom_metrics: { type: Object, default: {} },
    },

    /* ── Comparison Category ─────────────────────────── */
    category: { type: String, default: "" },
    segment: { type: String, default: "" },

    /* ── User Actions ────────────────────────────────── */
    selected_policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" },
    selected_at: { type: Date },
    conversion: { type: Boolean, default: false },

    /* ── Status & Timestamps ────────────────────────── */
    is_active: { type: Boolean, default: true, index: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

/* ── Indexing for Performance ────────────────────────── */
policyComparisonSchema.index({ comparison_id: 1 });
policyComparisonSchema.index({ user: 1, created_at: -1 });
policyComparisonSchema.index({ is_active: 1, conversion: 1 });

export default mongoose.model("PolicyComparison", policyComparisonSchema);
