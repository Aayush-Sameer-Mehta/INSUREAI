const mongoose = require("mongoose");
const { Schema } = mongoose;

const AgentEarningsSchema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },
    // Earnings Record
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    earningType: {
      type: String,
      enum: [
        "POLICY_COMMISSION",
        "RENEWAL_COMMISSION",
        "CLAIM_PROCESSING_BONUS",
        "PERFORMANCE_BONUS",
        "RETENTION_BONUS",
        "MILESTONE_BONUS",
        "REFERRAL_COMMISSION",
        "ADJUSTMENT",
        "CHARGEBACK",
        "OTHER",
      ],
      required: true,
      index: true,
    },
    // Reference Data
    policyReference: {
      policyId: {
        type: Schema.Types.ObjectId,
        ref: "Policy",
      },
      policyNumber: String,
      premium: Number,
      policyType: String,
      customerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    claimReference: {
      claimId: {
        type: Schema.Types.ObjectId,
        ref: "Claim",
      },
      claimNumber: String,
      processingDays: Number,
    },
    // Commission Details
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionPercentage: Number,
    bonusAmount: Number,
    taxDeducted: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: String,
    // Payment Status
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PROCESSING", "PAID", "FAILED", "REVERSED"],
      default: "PENDING",
      index: true,
    },
    // Important Dates
    earnedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    approvedAt: Date,
    payoutScheduledFor: Date,
    paidAt: Date,
    reversal: {
      reversedAt: Date,
      reversalReason: String,
      reversalAmount: Number,
    },
    // Period Information
    payoutCycle: {
      month: Number, // 1-12
      year: Number,
    },
    // Supporting Documents
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    // Internal Notes
    internalNotes: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Admin user
    },
    // Chargeback/Reversal Info
    chargebackDetails: {
      reason: String,
      reversalDate: Date,
      amount: Number,
    },
  },
  { timestamps: true },
);

// Indexes for efficient queries
AgentEarningsSchema.index({ agent: 1, earnedAt: -1 });
AgentEarningsSchema.index({ agent: 1, status: 1 });
AgentEarningsSchema.index({ agent: 1, payoutCycle: 1 });
AgentEarningsSchema.index({ payoutScheduledFor: 1, status: 1 });
AgentEarningsSchema.index({ earnedAt: -1 });

// Virtual for formatted amount
AgentEarningsSchema.virtual("formattedAmount").get(function () {
  return `₹${this.netAmount.toFixed(2)}`;
});

// Static method to calculate total earnings for a period
AgentEarningsSchema.statics.getTotalEarnings = async function (
  agentId,
  startDate,
  endDate,
) {
  const result = await this.aggregate([
    {
      $match: {
        agent: mongoose.Types.ObjectId(agentId),
        earnedAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["PAID", "APPROVED"] },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$netAmount" },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalEarnings: 0, count: 0 };
};

module.exports = mongoose.model("AgentEarnings", AgentEarningsSchema);
