const mongoose = require("mongoose");
const { Schema } = mongoose;

const AgentPerformanceMetricSchema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },
    // Period
    period: {
      year: { type: Number, required: true },
      month: { type: Number, required: true, min: 1, max: 12 },
      quarter: Number,
    },
    // Sales Metrics
    sales: {
      totalPoliciesSold: { type: Number, default: 0 },
      newPoliciesSold: { type: Number, default: 0 },
      renewalPoliciesSold: { type: Number, default: 0 },
      totalPremiumGenerated: { type: Number, default: 0 },
      averagePolicyValue: Number,
      topSellingPolicyType: String,
    },
    // Client Metrics
    clients: {
      newClientsOnboarded: { type: Number, default: 0 },
      totalActiveClients: { type: Number, default: 0 },
      clientRetentionRate: Number, // percentage
      clientLTV: Number, // Lifetime Value
    },
    // Lead Metrics
    leads: {
      totalLeadsGenerated: { type: Number, default: 0 },
      leadsContacted: { type: Number, default: 0 },
      leadsQualified: { type: Number, default: 0 },
      leadsConverted: { type: Number, default: 0 },
      conversionRate: Number, // percentage
      averageLeadConversionTime: Number, // days
    },
    // Claim Metrics
    claims: {
      claimsInitiated: { type: Number, default: 0 },
      averageClaimProcessingTime: Number, // days
      claimApprovalRate: Number, // percentage
      claimResolution: {
        approved: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        pending: { type: Number, default: 0 },
      },
    },
    // Earnings Metrics
    earnings: {
      totalEarnings: { type: Number, default: 0 },
      commissionEarnings: { type: Number, default: 0 },
      bonusEarnings: { type: Number, default: 0 },
      averageCommissionPerPolicy: Number,
      taxPaid: { type: Number, default: 0 },
    },
    // Performance Indicators
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tier: {
      type: String,
      enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
      default: "BRONZE",
    },
    targetAchievementPercentage: Number, // vs monthly target
    // Growth Metrics
    growth: {
      policiesSoldGrowth: Number, // % vs previous month
      earningsGrowth: Number, // % vs previous month
      clientGrowth: Number, // % vs previous month
      conversionRateGrowth: Number, // % vs previous month
    },
    // Comparative Metrics
    benchmarks: {
      rankAmongAgents: Number,
      percentileRank: Number,
      vs_regionalAverage: Number,
      vs_nationalAverage: Number,
    },
    // Achievements & Badges
    achievements: [
      {
        badge: String,
        earnedAt: Date,
      },
    ],
    // Document References
    supportingDocuments: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    // Notes
    internalNotes: String,
    managerReview: {
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
      feedback: String,
      rating: Number,
      recommendations: [String],
    },
    // Calculated Data (updated periodically)
    lastCalculatedAt: Date,
    isCalculationPending: { type: Boolean, default: false },
  },
  { timestamps: true },
);

AgentPerformanceMetricSchema.index(
  { agent: 1, year: 1, month: 1 },
  { unique: true },
);
AgentPerformanceMetricSchema.index({ agent: 1, tier: 1 });
AgentPerformanceMetricSchema.index({ tier: 1, period: 1 });
AgentPerformanceMetricSchema.index({ performanceScore: -1 });

// Method to calculate performance tier
AgentPerformanceMetricSchema.methods.calculateTier = function (
  policies = 0,
  revenue = 0,
) {
  if (policies >= 50 && revenue >= 100000) return "PLATINUM";
  if (policies >= 30 && revenue >= 75000) return "GOLD";
  if (policies >= 15 && revenue >= 35000) return "SILVER";
  return "BRONZE";
};

// Method to calculate performance score
AgentPerformanceMetricSchema.methods.calculatePerformanceScore = function () {
  let score = 0;

  // Sales contribution (40%)
  if (this.sales.totalPoliciesSold > 0) {
    score += Math.min(40, (this.sales.totalPoliciesSold / 50) * 40);
  }

  // Conversion rate (30%)
  if (this.leads.conversionRate) {
    score += Math.min(30, (this.leads.conversionRate / 25) * 30);
  }

  // Client retention (20%)
  if (this.clients.clientRetentionRate) {
    score += Math.min(20, (this.clients.clientRetentionRate / 90) * 20);
  }

  // Claim support (10%)
  if (this.claims.claimApprovalRate) {
    score += Math.min(10, (this.claims.claimApprovalRate / 95) * 10);
  }

  return Math.round(score);
};

// Static method to generate monthly metrics
AgentPerformanceMetricSchema.statics.generateMonthlyMetrics = async function (
  agentId,
) {
  const Policy = require("./Policy");
  const Lead = require("./Lead");
  const Claim = require("./Claim");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // TODO: Calculate metrics from actual data
  // This is a placeholder implementation

  const metrics = new this({
    agent: agentId,
    period: { year, month, quarter: Math.ceil(month / 3) },
    sales: {
      totalPoliciesSold: 0,
      newPoliciesSold: 0,
      totalPremiumGenerated: 0,
    },
    // ... rest of metrics
  });

  return await metrics.save();
};

module.exports = mongoose.model(
  "AgentPerformanceMetric",
  AgentPerformanceMetricSchema,
);
