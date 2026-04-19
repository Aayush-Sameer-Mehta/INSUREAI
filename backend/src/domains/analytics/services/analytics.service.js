import User from "../../users/models/User.js";
import Policy from "../../policies/models/Policy.js";
import Claim from "../../claims/models/Claim.js";

function monthKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

export async function getAnalyticsV2() {
  const [totalUsers, totalPolicies, totalClaims, policies, claims, users] = await Promise.all([
    User.countDocuments(),
    Policy.countDocuments(),
    Claim.countDocuments(),
    Policy.find().select("category popularityScore").lean(),
    Claim.find().select("status createdAt fraudRiskLevel").lean(),
    User.find().select("createdAt purchasedPolicies").lean(),
  ]);

  const revenue = users.reduce(
    (sum, user) => sum + (user.purchasedPolicies || []).reduce((s, p) => s + Number(p.amount || 0), 0),
    0
  );

  const approved = claims.filter((c) => c.status === "Approved" || c.status === "Paid").length;
  const fraudAlerts = claims.filter((c) => c.fraudRiskLevel === "High Risk").length;
  const approvalRate = totalClaims ? Number(((approved / totalClaims) * 100).toFixed(2)) : 0;

  const monthlyClaimsMap = {};
  const customerGrowthMap = {};
  const revenueMap = {};
  for (const c of claims) {
    const key = monthKey(c.createdAt);
    monthlyClaimsMap[key] = (monthlyClaimsMap[key] || 0) + 1;
  }
  for (const u of users) {
    const key = monthKey(u.createdAt);
    customerGrowthMap[key] = (customerGrowthMap[key] || 0) + 1;
    for (const purchase of u.purchasedPolicies || []) {
      const rKey = monthKey(purchase.purchasedAt || u.createdAt);
      revenueMap[rKey] = (revenueMap[rKey] || 0) + Number(purchase.amount || 0);
    }
  }

  const popularity = policies.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + Number(p.popularityScore || 0) + 1;
    return acc;
  }, {});

  return {
    kpis: {
      totalUsers,
      activePolicies: totalPolicies,
      totalClaims,
      revenueGenerated: revenue,
      fraudAlerts,
      claimApprovalRate: approvalRate,
    },
    charts: {
      monthlyClaims: monthlyClaimsMap,
      revenueTrends: revenueMap,
      policyPopularity: popularity,
      customerGrowth: customerGrowthMap,
    },
  };
}

export async function getPremiumAnalytics(filters = {}) {
  const { startDate, endDate, category, paymentStatus } = filters;

  const users = await User.find({ "purchasedPolicies.0": { $exists: true } })
    .select("purchasedPolicies")
    .populate("purchasedPolicies.policy", "policyId name company category price")
    .lean();

  let premiumUsersCount = 0;
  let completedPaymentUsersCount = 0;
  let totalPremiumRevenue = 0;

  const policyWiseCount = {};
  const recentlyPurchased = [];
  const topSellingMap = {};

  for (const user of users) {
    let hasMatchingPolicy = false;
    let hasCompletedPayment = false;

    for (const purchase of user.purchasedPolicies) {
      const pDate = new Date(purchase.purchasedAt);
      const sDate = startDate ? new Date(startDate) : null;
      const eDate = endDate ? new Date(endDate) : null;

      // Ensure eDate covers the end of the day if it's just a date string
      if (eDate) {
        eDate.setHours(23, 59, 59, 999);
      }

      if (sDate && pDate < sDate) continue;
      if (eDate && pDate > eDate) continue;

      const pCategory = purchase.policy?.category;
      if (category && pCategory !== category) continue;

      const pStatus = purchase.paymentStatus || "Paid";
      if (paymentStatus && pStatus !== paymentStatus) continue;

      hasMatchingPolicy = true;

      if (pStatus === "Paid") {
        hasCompletedPayment = true;
        totalPremiumRevenue += Number(purchase.amount || 0);
      }

      if (pCategory) {
        policyWiseCount[pCategory] = (policyWiseCount[pCategory] || 0) + 1;
      }

      const policyId = purchase.policy?._id?.toString();
      if (policyId) {
        if (!topSellingMap[policyId]) {
          topSellingMap[policyId] = {
            policyId: purchase.policy.policyId,
            name: purchase.policy.name,
            company: purchase.policy.company,
            category: purchase.policy.category,
            count: 0,
            revenue: 0
          };
        }
        topSellingMap[policyId].count += 1;
        topSellingMap[policyId].revenue += Number(purchase.amount || 0);
      }

      recentlyPurchased.push({
        _id: purchase._id,
        policyName: purchase.policy?.name,
        company: purchase.policy?.company,
        category: pCategory,
        amount: purchase.amount,
        paymentStatus: pStatus,
        purchasedAt: purchase.purchasedAt
      });
    }

    if (hasMatchingPolicy) {
      premiumUsersCount++;
    }
    if (hasCompletedPayment) {
      completedPaymentUsersCount++;
    }
  }

  recentlyPurchased.sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

  const topSellingPolicies = Object.values(topSellingMap).sort((a, b) => b.count - a.count);

  return {
    totalPremiumUsers: premiumUsersCount,
    completedPaymentUsers: completedPaymentUsersCount,
    totalPremiumRevenue,
    policyWiseCount,
    recentlyPurchased: recentlyPurchased.slice(0, 10), // Top 10 recent
    topSellingPolicies: topSellingPolicies.slice(0, 10), // Top 10 selling
  };
}
