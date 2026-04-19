import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, unique: true, index: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    policy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true,
    },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    premium_amount: { type: Number, required: true, min: 0 },
    payment_method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "cash", "bank_transfer"],
      default: "upi",
    },
    payment_reference: { type: String, default: "", trim: true },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Paid",
      index: true,
    },
    commission_percentage: { type: Number, default: 0, min: 0, max: 100 },
    commission_amount: { type: Number, default: 0, min: 0 },
    commission_status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
      index: true,
    },
    renewal_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    auto_renewal_flag: { type: Boolean, default: false },
    renewal_status: {
      type: String,
      enum: ["Not Due", "Pending", "In Progress", "Completed", "Cancelled"],
      default: "Not Due",
      index: true,
    },
    ai_score: { type: Number, default: 0, min: 0, max: 100 },
    agent_score: { type: Number, default: 0, min: 0, max: 100 },
    final_recommendation_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    recommendation_source: {
      type: String,
      enum: ["AI", "Agent", "Hybrid"],
      default: "AI",
      index: true,
    },
  },
  { timestamps: true },
);

paymentSchema.pre("validate", function (next) {
  if (!this.paymentId) {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.paymentId = `PMT-${stamp}-${random}`;
  }
  next();
});

paymentSchema.index({ user_id: 1, createdAt: -1 });
paymentSchema.index({ policy_id: 1, payment_status: 1 });
paymentSchema.index({ agent_id: 1, commission_status: 1 });
paymentSchema.index({ renewal_agent_id: 1, renewal_status: 1 });

export default mongoose.model("Payment", paymentSchema);
