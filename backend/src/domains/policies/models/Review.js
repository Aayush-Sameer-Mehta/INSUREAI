import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true,
    },
    user: { type: String, required: true }, // username string
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ── Indexing for Performance ────────────────────────── */
reviewSchema.index({ policy: 1, rating: -1 });
reviewSchema.index({ is_active: 1 });

export default mongoose.model("Review", reviewSchema);
