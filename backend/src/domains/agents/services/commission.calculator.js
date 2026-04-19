const AgentCommissionRule = require("../../models/AgentCommissionRule");
const AgentEarnings = require("../../models/AgentEarnings");
const Agent = require("../../models/Agent");

class CommissionCalculator {
  /**
   * Calculate commission for a new policy sale
   * @param {ObjectId} agentId - Agent ID
   * @param {ObjectId} policyId - Policy ID
   * @param {number} premium - Policy premium amount
   * @param {string} policyType - Type of policy
   * @param {number} year - Policy year (1 for first year, 2+ for renewals)
   * @returns {Object} Commission calculation result
   */
  static async calculatePolicyCommission(
    agentId,
    policyId,
    premium,
    policyType,
    year = 1,
  ) {
    try {
      // Get agent details
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error("Agent not found");
      }

      // Get applicable commission rules
      const applicableRules = await this.getApplicableRules(agent, policyType);

      if (applicableRules.length === 0) {
        throw new Error("No applicable commission rule found");
      }

      // Use the highest priority rule
      const rule = applicableRules[0];

      // Get policies sold this month by agent
      const currentDate = new Date();
      const monthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const monthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const policiesSoldThisMonth = await AgentEarnings.countDocuments({
        agent: agentId,
        earningType: "POLICY_COMMISSION",
        earnedAt: { $gte: monthStart, $lte: monthEnd },
      });

      // Calculate base commission
      let commission = rule.calculateCommission(
        premium,
        year,
        policiesSoldThisMonth,
      );

      // Calculate tax
      let taxAmount = 0;
      if (rule.taxApplicable) {
        taxAmount = (commission * rule.taxPercentage) / 100;
      }

      // Net amount after tax
      const netAmount = commission - taxAmount;

      return {
        success: true,
        commission: {
          baseAmount: commission,
          basePercentage:
            year === 1
              ? rule.percentageCommission?.firstYearPercentage
              : rule.percentageCommission?.renewalYearPercentage,
          taxAmount: taxAmount,
          netAmount: netAmount,
          calculatedAt: new Date(),
          ruleId: rule._id,
          ruleName: rule.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate claim processing bonus
   * @param {ObjectId} agentId - Agent ID
   * @param {number} processingDays - Days taken to process claim
   * @param {number} claimAmount - Claim amount
   * @returns {Object} Bonus calculation
   */
  static async calculateClaimBonus(agentId, processingDays, claimAmount) {
    try {
      const agent = await Agent.findById(agentId);
      const rule = await AgentCommissionRule.findOne({
        "bonusStructure.claimProcessingBonus.enabled": true,
        isActive: true,
      });

      if (!rule || !rule.bonusStructure.claimProcessingBonus.enabled) {
        return { success: true, bonus: 0 };
      }

      const condition = rule.bonusStructure.claimProcessingBonus.condition;
      const bonusPerClaim =
        rule.bonusStructure.claimProcessingBonus.bonusPerClaim;

      let bonus = 0;
      if (condition === "SAME_DAY" && processingDays <= 1) {
        bonus = bonusPerClaim;
      } else if (condition === "WITHIN_5_DAYS" && processingDays <= 5) {
        bonus = bonusPerClaim;
      } else if (condition === "WITHIN_10_DAYS" && processingDays <= 10) {
        bonus = bonusPerClaim;
      }

      return {
        success: true,
        bonus: bonus,
        reason:
          bonus > 0
            ? `Quick claim processing (${processingDays} days)`
            : "Claim processing time exceeded bonus criteria",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate performance bonus
   * @param {ObjectId} agentId - Agent ID
   * @param {number} month - Month number
   * @param {number} year - Year
   * @returns {Object} Performance bonus
   */
  static async calculatePerformanceBonus(agentId, month, year) {
    try {
      // Get performance metrics
      const AgentPerformanceMetric = require("../../models/AgentPerformanceMetric");
      const metric = await AgentPerformanceMetric.findOne({
        agent: agentId,
        "period.month": month,
        "period.year": year,
      });

      if (!metric) {
        return { success: true, bonus: 0, reason: "No performance data" };
      }

      const rule = await AgentCommissionRule.findOne({
        "bonusStructure.performanceBonus.enabled": true,
        isActive: true,
      });

      if (!rule || !rule.bonusStructure.performanceBonus.enabled) {
        return { success: true, bonus: 0 };
      }

      const { thresholdPolicies, bonusPercentage } =
        rule.bonusStructure.performanceBonus;
      const totalEarnings = metric.earnings.totalEarnings;

      let bonus = 0;
      if (metric.sales.totalPoliciesSold >= thresholdPolicies) {
        bonus = (totalEarnings * bonusPercentage) / 100;
      }

      return {
        success: true,
        bonus: bonus,
        totalEarnings: totalEarnings,
        policiesSold: metric.sales.totalPoliciesSold,
        threshold: thresholdPolicies,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get applicable commission rules for an agent
   * @private
   */
  static async getApplicableRules(agent, policyType) {
    const rules = await AgentCommissionRule.find({
      $or: [
        { policyTypes: { $size: 0 } }, // All policy types
        { policyTypes: policyType },
      ],
      $or: [{ agentTiers: "ALL" }, { agentTiers: agent.performanceTier }],
      isActive: true,
      validFrom: { $lte: new Date() },
      $or: [{ validTill: null }, { validTill: { $gte: new Date() } }],
    }).sort({ priority: 1 });

    return rules;
  }

  /**
   * Process monthly payout
   * @param {ObjectId} agentId - Agent ID
   * @param {number} month - Month
   * @param {number} year - Year
   * @returns {Object} Payout summary
   */
  static async processMonthlyPayout(agentId, month, year) {
    try {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);

      // Get all earnings for the month
      const earnings = await AgentEarnings.find({
        agent: agentId,
        earnedAt: { $gte: monthStart, $lte: monthEnd },
        status: { $in: ["PENDING", "APPROVED"] },
      });

      let totalAmount = 0;
      let totalEarnings = 0;

      for (let earning of earnings) {
        totalAmount += earning.netAmount;
        totalEarnings += earning.baseAmount;
      }

      // Update agent's pending commission
      const agent = await Agent.findByIdAndUpdate(
        agentId,
        {
          $inc: {
            pendingCommission: totalAmount,
          },
        },
        { new: true },
      );

      return {
        success: true,
        agentId: agentId,
        month: month,
        year: year,
        totalTransactions: earnings.length,
        totalEarnings: totalEarnings,
        totalTaxDeducted: totalEarnings - totalAmount,
        netAmount: totalAmount,
        payoutDate: new Date(year, month, 5), // Can be customized
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get commission history
   * @param {ObjectId} agentId - Agent ID
   * @param {Object} filters - Query filters
   * @returns {Array} Commission records
   */
  static async getCommissionHistory(agentId, filters = {}) {
    try {
      const query = { agent: agentId };

      if (filters.startDate || filters.endDate) {
        query.earnedAt = {};
        if (filters.startDate)
          query.earnedAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.earnedAt.$lte = new Date(filters.endDate);
      }

      if (filters.earningType) {
        query.earningType = filters.earningType;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const earnings = await AgentEarnings.find(query)
        .populate("policyReference.policyId")
        .sort({ earnedAt: -1 })
        .limit(filters.limit || 50)
        .skip(filters.skip || 0);

      const total = await AgentEarnings.countDocuments(query);

      return {
        success: true,
        data: earnings,
        total: total,
        page: Math.floor((filters.skip || 0) / (filters.limit || 50)) + 1,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = CommissionCalculator;
