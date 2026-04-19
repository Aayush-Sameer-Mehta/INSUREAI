const mongoose = require("mongoose");
const { Schema } = mongoose;

const AgentCommissionRuleSchema = new Schema(
  {
    // Rule Identification
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    // Applicability
    policyTypes: [
      {
        type: String,
        enum: [
          "TERM_LIFE",
          "WHOLE_LIFE",
          "ENDOWMENT",
          "ULIP",
          "HEALTH",
          "CRITICAL_ILLNESS",
          "MOTOR",
          "HOME",
          "TRAVEL",
          "BUSINESS",
        ],
      },
    ],
    agentTiers: {
      type: [
        {
          type: String,
        },
      ],
      enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM", "ALL"],
    },
    // Commission Structure
    commissionType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT_AMOUNT", "TIERED", "SLAB_BASED"],
      default: "PERCENTAGE",
    },
    // Percentage-based Commission
    percentageCommission: {
      firstYearPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      renewalYearPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
    // Flat Amount Commission
    flatAmount: Number,
    // Tiered Commission (based on policies sold)
    tieredCommission: [
      {
        minPoliciesSold: Number,
        maxPoliciesSold: Number,
        commissionPercentage: Number,
      },
    ],
    // Slab-based Commission (based on premium amount)
    slabCommission: [
      {
        minPremium: Number,
        maxPremium: Number,
        commissionPercentage: Number,
      },
    ],
    // Bonuses & Incentives
    bonusStructure: {
      claimProcessingBonus: {
        enabled: { type: Boolean, default: false },
        bonusPerClaim: Number,
        condition: {
          type: String,
          enum: ["WITHIN_5_DAYS", "WITHIN_10_DAYS", "SAME_DAY"],
        },
      },
      performanceBonus: {
        enabled: { type: Boolean, default: false },
        thresholdPolicies: Number,
        bonusPercentage: Number,
        period: {
          type: String,
          enum: ["MONTHLY", "QUARTERLY", "YEARLY"],
        },
      },
      conversionBonus: {
        enabled: { type: Boolean, default: false },
        bonusPerConversion: Number,
        minConversionsRequired: Number,
      },
      retentionBonus: {
        enabled: { type: Boolean, default: false },
        bonusPerRenewal: Number,
        renewalThresholdDays: Number,
      },
    },
    // Minimum & Maximum Limits
    minimumCommissionAmount: {
      type: Number,
      default: 0,
    },
    maximumCommissionAmount: {
      type: Number,
      default: null,
    },
    // Tax Treatment
    taxApplicable: {
      type: Boolean,
      default: true,
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Validity
    validFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    validTill: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Priority (for overlapping rules)
    priority: {
      type: Number,
      default: 100,
    },
    // Additional Conditions
    conditions: {
      minimumPremium: Number,
      specificProductLines: [String],
      excludedProductLines: [String],
      geographicRestrictions: [String],
      customerAgeGroup: {
        minAge: Number,
        maxAge: Number,
      },
    },
    // Approval & Versioning
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
    notes: String,
    // Change History
    changeHistory: [
      {
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        changes: Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true },
);

AgentCommissionRuleSchema.index({ isActive: 1, validFrom: 1 });
AgentCommissionRuleSchema.index({ policyTypes: 1, isActive: 1 });
AgentCommissionRuleSchema.index({ agentTiers: 1, isActive: 1 });

// Method to check if rule is applicable
AgentCommissionRuleSchema.methods.isApplicable = function (
  policyType,
  agentTier,
  currentDate,
) {
  const isInDateRange =
    (!this.validFrom || this.validFrom <= currentDate) &&
    (!this.validTill || this.validTill >= currentDate);

  const isPolicyTypeMatch =
    this.policyTypes.length === 0 || this.policyTypes.includes(policyType);
  const isAgentTierMatch =
    this.agentTiers.includes("ALL") || this.agentTiers.includes(agentTier);

  return (
    isInDateRange && isPolicyTypeMatch && isAgentTierMatch && this.isActive
  );
};

// Calculate commission
AgentCommissionRuleSchema.methods.calculateCommission = function (
  premium,
  year = 1,
  policiesSoldThisMonth = 0,
) {
  let commission = 0;

  if (this.commissionType === "PERCENTAGE") {
    const percentage =
      year === 1
        ? this.percentageCommission.firstYearPercentage
        : this.percentageCommission.renewalYearPercentage;
    commission = (premium * percentage) / 100;
  } else if (this.commissionType === "FLAT_AMOUNT") {
    commission = this.flatAmount;
  } else if (this.commissionType === "TIERED") {
    const tier = this.tieredCommission.find(
      (t) =>
        policiesSoldThisMonth >= t.minPoliciesSold &&
        (!t.maxPoliciesSold || policiesSoldThisMonth <= t.maxPoliciesSold),
    );
    if (tier) {
      commission = (premium * tier.commissionPercentage) / 100;
    }
  } else if (this.commissionType === "SLAB_BASED") {
    const slab = this.slabCommission.find(
      (s) =>
        premium >= s.minPremium && (!s.maxPremium || premium <= s.maxPremium),
    );
    if (slab) {
      commission = (premium * slab.commissionPercentage) / 100;
    }
  }

  // Apply minimum limit
  if (commission < this.minimumCommissionAmount) {
    commission = this.minimumCommissionAmount;
  }

  // Apply maximum limit
  if (
    this.maximumCommissionAmount &&
    commission > this.maximumCommissionAmount
  ) {
    commission = this.maximumCommissionAmount;
  }

  return commission;
};

module.exports = mongoose.model(
  "AgentCommissionRule",
  AgentCommissionRuleSchema,
);
