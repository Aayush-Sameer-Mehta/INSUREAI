import mongoose from "mongoose";

const fraudReviewSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
      unique: true,
      index: true,
    },
    fraudScore: { type: Number, required: true, min: 0, max: 100 },
    fraudLevel: {
      type: String,
      enum: ["Low Risk", "Medium Risk", "High Risk"],
      required: true,
      index: true,
    },
    reasons: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending", "Cleared", "Escalated", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    notes: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ── Indexing for Performance ────────────────────────── */
fraudReviewSchema.index({ claim: 1, status: 1 });
fraudReviewSchema.index({ fraudScore: -1, is_active: 1 });

export default mongoose.model("FraudReview", fraudReviewSchema);
