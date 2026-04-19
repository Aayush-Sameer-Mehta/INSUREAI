const Agent = require("../../models/Agent");
const AgentKYC = require("../../models/AgentKYC");
const AgentBankDetails = require("../../models/AgentBankDetails");
const User = require("../../models/User");
const Lead = require("../../models/Lead");
const Policy = require("../../models/Policy");
const Claim = require("../../models/Claim");
const AgentPerformanceMetric = require("../../models/AgentPerformanceMetric");
const CommissionCalculator = require("./commission.calculator");

class AgentService {
  /**
   * Register a new agent (create pending agent record)
   */
  static async registerAgent(userData, kycData) {
    try {
      // Create user account
      const user = new User({
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "AGENT",
        isActive: false,
      });
      await user.save();

      // Create agent record
      const agent = new Agent({
        user: user._id,
        agent_id: `AG-${Date.now()}`,
        agent_name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        license_number: userData.licenseNumber || `LIC-${Date.now()}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        agencyName: userData.agencyName,
        yearsOfExperience: userData.yearsOfExperience,
        status: "PENDING_APPROVAL",
        kycStatus: "PENDING",
      });
      await agent.save();

      // Create KYC record
      const kyc = new AgentKYC({
        agent: agent._id,
        panCard: kycData.panCard,
        aadhar: kycData.aadhar,
        addressProof: kycData.addressProof,
        insuranceLicense: kycData.insuranceLicense,
        agencyName: kycData.agencyName,
        businessRegistration: kycData.businessRegistration,
        overallStatus: "PENDING_REVIEW",
      });
      await kyc.save();

      agent.kycDocument = kyc._id;
      await agent.save();

      return {
        success: true,
        agent: agent,
        message: "Agent registration submitted. Awaiting admin approval.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get agent dashboard data
   */
  static async getAgentDashboard(agentId) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) throw new Error("Agent not found");

      // Get current month metrics
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Basic metrics
      const totalClients = await User.countDocuments({
        referredBy: agentId,
        role: "USER",
      });

      const activePolicies = await Policy.countDocuments({
        agent: agentId,
        status: "ACTIVE",
      });

      const pendingClaims = await Claim.countDocuments({
        agent: agentId,
        status: { $in: ["SUBMITTED", "UNDER_REVIEW"] },
      });

      // Monthly performance
      const monthlyEarnings = await CommissionCalculator.getCommissionHistory(
        agentId,
        {
          startDate: monthStart,
          endDate: monthEnd,
          status: ["PAID", "APPROVED"],
        },
      );

      // Get total earnings for month
      const monthlyTotal = monthlyEarnings.data.reduce(
        (sum, e) => sum + e.netAmount,
        0,
      );

      // Get performance metrics
      const performanceMetric = await AgentPerformanceMetric.findOne({
        agent: agentId,
        "period.month": now.getMonth() + 1,
        "period.year": now.getFullYear(),
      });

      // Get recent activities
      const recentActivities = await this.getRecentActivities(agentId, 10);

      return {
        success: true,
        dashboard: {
          kpis: {
            totalClients: totalClients,
            activePolicies: activePolicies,
            pendingClaims: pendingClaims,
            monthlyEarnings: monthlyTotal,
            totalEarnings: agent.total_commission_earned,
            performanceTier: agent.performanceTier,
          },
          performance: {
            conversionRate: performanceMetric?.leads.conversionRate || 0,
            clientRetention:
              performanceMetric?.clients.clientRetentionRate || 0,
            avgPolcyValue: performanceMetric?.sales.averagePolicyValue || 0,
          },
          recentActivities: recentActivities,
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
   * Approve an agent (admin function)
   */
  static async approveAgent(agentId, approvedBy, notes = "") {
    try {
      const agent = await Agent.findByIdAndUpdate(
        agentId,
        {
          status: "ACTIVE",
          is_active: true,
          approvedBy: approvedBy,
          approvalDate: new Date(),
          approvalNotes: notes,
        },
        { new: true },
      );

      // Activate user account
      await User.findByIdAndUpdate(agent.user, { isActive: true });

      // Update KYC status
      await AgentKYC.findByIdAndUpdate(agent.kycDocument, {
        overallStatus: "APPROVED",
        approvedAt: new Date(),
        approvedBy: approvedBy,
      });

      return {
        success: true,
        agent: agent,
        message: "Agent approved successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get agent performance metrics
   */
  static async getPerformanceMetrics(agentId, month, year) {
    try {
      const metric = await AgentPerformanceMetric.findOne({
        agent: agentId,
        "period.month": month,
        "period.year": year,
      });

      if (!metric) {
        return {
          success: false,
          error: "No performance data for this period",
        };
      }

      return {
        success: true,
        metrics: metric,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update agent bank details
   */
  static async updateBankDetails(agentId, bankData) {
    try {
      let bankDetails = await AgentBankDetails.findOne({ agent: agentId });

      if (!bankDetails) {
        bankDetails = new AgentBankDetails({
          agent: agentId,
          ...bankData,
        });
      } else {
        // Store previous details
        bankDetails.previousDetails.push({
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          accountHolderName: bankDetails.accountHolderName,
          changedAt: new Date(),
        });

        // Update with new details
        Object.assign(bankDetails, bankData);
        bankDetails.isVerified = false; // Reset verification
      }

      await bankDetails.save();

      return {
        success: true,
        bankDetails: bankDetails,
        message: "Bank details updated. Awaiting verification.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get agent clients
   */
  static async getAgentClients(agentId, filters = {}) {
    try {
      const query = { referredBy: agentId, role: "USER" };

      if (filters.status) {
        query.status = filters.status;
      }

      const clients = await User.find(query)
        .select("_id firstName lastName email phone status createdAt")
        .limit(filters.limit || 50)
        .skip(filters.skip || 0)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      // Get client policies count
      const enrichedClients = await Promise.all(
        clients.map(async (client) => {
          const policiesCount = await Policy.countDocuments({
            customer: client._id,
            status: "ACTIVE",
          });
          return {
            ...client.toObject(),
            policiesCount: policiesCount,
          };
        }),
      );

      return {
        success: true,
        clients: enrichedClients,
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

  /**
   * Get agent leads
   */
  static async getAgentLeads(agentId, filters = {}) {
    try {
      const query = { agent: agentId };

      if (filters.status) {
        query.status = filters.status;
      }

      const leads = await Lead.find(query)
        .populate("agent", "agent_name email")
        .limit(filters.limit || 50)
        .skip(filters.skip || 0)
        .sort({ createdAt: -1 });

      const total = await Lead.countDocuments(query);

      return {
        success: true,
        leads: leads,
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

  /**
   * Get recent activities
   * @private
   */
  static async getRecentActivities(agentId, limit = 10) {
    try {
      const activities = [];

      // Recent policies sold
      const policies = await Policy.find({ agent: agentId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("_id policyNumber createdAt");

      policies.forEach((p) => {
        activities.push({
          type: "POLICY_SOLD",
          title: `Policy sold: ${p.policyNumber}`,
          timestamp: p.createdAt,
          icon: "📋",
        });
      });

      // Recent commissions
      const CommissionCalculator = require("./commission.calculator");
      const commissions = await CommissionCalculator.getCommissionHistory(
        agentId,
        { limit: 2 },
      );

      commissions.data.forEach((c) => {
        activities.push({
          type: "COMMISSION_CREDITED",
          title: `Commission credited: ₹${c.netAmount}`,
          timestamp: c.earnedAt,
          icon: "💰",
        });
      });

      // Sort by timestamp and limit
      activities.sort((a, b) => b.timestamp - a.timestamp);
      return activities.slice(0, limit);
    } catch (error) {
      console.error("Error getting recent activities:", error);
      return [];
    }
  }

  /**
   * Calculate agent performance tier
   * @private
   */
  static async calculatePerformanceTier(agentId) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const metric = await AgentPerformanceMetric.findOne({
        agent: agentId,
        "period.year": year,
        "period.month": month,
      });

      if (!metric) return "BRONZE";

      return metric.calculateTier(
        metric.sales.totalPoliciesSold,
        metric.earnings.totalEarnings,
      );
    } catch (error) {
      console.error("Error calculating performance tier:", error);
      return "BRONZE";
    }
  }
}

module.exports = AgentService;
