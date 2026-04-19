import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/domains/users/models/User.js";
import Policy from "../src/domains/policies/models/Policy.js";
import Claim from "../src/domains/claims/models/Claim.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  await User.updateMany(
    { occupationRiskClass: { $exists: false } },
    {
      $set: {
        occupationRiskClass: "Low",
        drivingProfile: {
          vehicleType: "none",
          yearsOfDriving: 0,
          accidentsLast3Years: 0,
          trafficViolationsLast3Years: 0,
        },
        claimStats: { totalClaims: 0, approvedClaims: 0, rejectedClaims: 0 },
        riskProfileSnapshot: {
          score: 0,
          category: "Low Risk",
          updatedAt: new Date(),
          factors: {},
        },
      },
    }
  );

  await Policy.updateMany(
    { claimSettlementRatio: { $exists: false } },
    {
      $set: {
        claimSettlementRatio: 85,
        waitingPeriodDays: 0,
        networkCount: 0,
        popularityScore: 0,
        requiredDocumentTypes: [],
      },
    }
  );

  await Claim.updateMany(
    { fraudRiskScore: { $exists: false } },
    {
      $set: {
        documentRefs: [],
        fraudRiskScore: 0,
        fraudRiskLevel: "Low Risk",
        fraudSignals: [],
        requiresFraudReview: false,
        paymentState: "Pending",
      },
    }
  );

  const claims = await Claim.find().select("status workflowTimeline user");
  for (const claim of claims) {
    if (!Array.isArray(claim.workflowTimeline) || claim.workflowTimeline.length === 0) {
      claim.workflowTimeline = [
        {
          status: claim.status || "Submitted",
          note: "Backfilled timeline entry",
          actor: claim.user,
          at: claim.createdAt || new Date(),
        },
      ];
      await claim.save();
    }
  }

  await mongoose.disconnect();
  console.log("Advanced migration complete.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
