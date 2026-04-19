import Claim from "../../claims/models/Claim.js";
import Payment from "../../payments/models/Payment.js";
import Policy from "../../policies/models/Policy.js";
import User from "../../users/models/User.js";

export async function buildUserDashboard(userId) {
  const [user, claims, payments] = await Promise.all([
    User.findById(userId).populate(
      "purchasedPolicies.policy",
      "policyId name company category price coverage",
    ),
    Claim.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    Payment.find({ user_id: userId }).sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    user,
    summary: {
      activePolicies: user?.purchasedPolicies?.length || 0,
      totalClaims: claims.length,
      assignedAgentId: user?.user_profile?.assigned_agent_id || null,
    },
    recentClaims: claims,
    recentPayments: payments,
  };
}

export async function buildAgentDashboard(agentId) {
  const [customers, claims, commissions, renewals] = await Promise.all([
    User.find({
      role: "USER",
      "user_profile.assigned_agent_id": agentId,
    })
      .select("fullName email mobileNumber user_profile createdAt")
      .sort({ createdAt: -1 }),
    Claim.find({ agent_id: agentId })
      .populate("user", "fullName email")
      .populate("policy", "policyId name")
      .sort({ createdAt: -1 })
      .limit(10),
    Payment.find({ agent_id: agentId })
      .populate("user_id", "fullName email")
      .populate("policy_id", "policyId name")
      .sort({ createdAt: -1 })
      .limit(10),
    Payment.find({
      renewal_agent_id: agentId,
      renewal_status: { $in: ["Pending", "In Progress"] },
    })
      .populate("user_id", "fullName email")
      .populate("policy_id", "policyId name")
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  return {
    summary: {
      assignedCustomers: customers.length,
      claimsAssisted: claims.length,
      pendingCommissionAmount: commissions
        .filter((item) => item.commission_status === "Pending")
        .reduce((sum, item) => sum + (item.commission_amount || 0), 0),
      renewalsDue: renewals.length,
    },
    customers,
    claims,
    commissions,
    renewals,
  };
}

export async function buildAdminDashboard() {
  const [usersByRole, policies, claims, payments] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
    Policy.countDocuments(),
    Claim.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPremium: { $sum: "$premium_amount" },
          totalCommission: { $sum: "$commission_amount" },
          paidPayments: {
            $sum: {
              $cond: [{ $eq: ["$payment_status", "Paid"] }, 1, 0],
            },
          },
        },
      },
    ]),
  ]);

  return {
    usersByRole,
    totalPolicies: policies,
    claimsByStatus: claims,
    payments: payments[0] || {
      totalPremium: 0,
      totalCommission: 0,
      paidPayments: 0,
    },
  };
}
