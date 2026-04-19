import { Router } from "express";
import auth from "../../../middleware/auth.js";
import authorize from "../../../middleware/authorize.js";
import Policy from "../../policies/models/Policy.js";
import User from "../models/User.js";
import AppError from "../../../utils/AppError.js";
import { scheduleRenewalRemindersForUser } from "../../notifications/services/reminder.service.js";
import { buildUserDashboard } from "../../analytics/services/dashboard.service.js";
import { recordPolicyPurchase } from "../../payments/services/purchase.service.js";
import fs from "fs/promises";

const router = Router();

router.use(auth);

router.get("/dashboard", authorize(["USER"]), async (req, res, next) => {
  try {
    const dashboard = await buildUserDashboard(req.user._id);
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
});

/* ─── Get user profile (with purchased policies) ─────── */
router.get("/profile", async (req, res, next) => {
  try {
    const user = await req.user.populate("purchasedPolicies.policy");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

/* ─── Purchase a policy ──────────────────────────────── */
router.post("/purchase", authorize(["USER"]), async (req, res, next) => {
  try {
    const { policyId, agentId, autoRenewalFlag, recommendation = {} } = req.body;
    if (!policyId) {
      return res.status(400).json({ message: "policyId is required" });
    }

    // Accept both policyId string ("fe-car-1") and MongoDB _id
    const policy =
      (await Policy.findOne({ policyId })) ||
      (await Policy.findById(policyId).catch(() => null));

    if (!policy) return res.status(404).json({ message: "Policy not found" });

    const alreadyPurchased = req.user.purchasedPolicies.some(
      (purchase) => String(purchase.policy) === String(policy._id),
    );
    if (alreadyPurchased) {
      return next(new AppError("Policy already purchased", 409));
    }

    const purchaseResult = await recordPolicyPurchase({
      user: req.user,
      policy,
      paymentMethod: "upi",
      paymentStatus: "Paid",
      requestedAgentId: agentId,
      recommendation,
      autoRenewalFlag,
    });
    await scheduleRenewalRemindersForUser(req.user);

    const populated = await req.user.populate("purchasedPolicies.policy");
    res.status(201).json({
      user: populated,
      purchase: purchaseResult.purchase,
      payment: purchaseResult.payment,
    });
  } catch (err) {
    next(err);
  }
});

/* ─── Update user profile ────────────────────────────── */
router.put("/profile", authorize(["USER", "AGENT", "ADMIN"]), async (req, res, next) => {
  try {
    const allowedFields = [
      "fullName",
      "dateOfBirth",
      "gender",
      "mobileNumber",
      "occupation",
      "annualIncome",
      "maritalStatus",
      "numberOfDependents",
      "lifestyleHabits",
      "existingInsurance",
      "riskAppetite",
      "city",
      "state",
      "nomineeName",
      "nomineeRelation",
      "user_profile",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "user_profile") {
          req.user.user_profile = {
            ...(req.user.user_profile?.toObject?.() || req.user.user_profile || {}),
            ...req.body.user_profile,
          };
        } else {
          req.user[field] = req.body[field];
        }
      }
    });

    await req.user.save();
    const populated = await req.user.populate("purchasedPolicies.policy");
    res.json(populated);
  } catch (err) {
    next(err);
  }
});

/* ─── KYC Verification ───────────────────────────────── */
router.put("/kyc", authorize(["USER"]), async (req, res, next) => {
  try {
    const { panCardNumber, aadhaarNumber } = req.body;
    if (!panCardNumber || !aadhaarNumber) {
      return res
        .status(400)
        .json({ message: "PAN and Aadhaar are required for KYC" });
    }

    const isVerified =
      panCardNumber.length === 10 && aadhaarNumber.length === 12;

    req.user.kycDetails = {
      panCardNumber: panCardNumber.toUpperCase(),
      aadhaarNumber,
      isKycVerified: isVerified,
    };

    if (isVerified && req.user.riskProfileSnapshot) {
      req.user.riskProfileSnapshot.score = Math.min(
        100,
        (req.user.riskProfileSnapshot.score || 50) + 15,
      );
    }

    await req.user.save();
    res.json({
      success: true,
      verified: isVerified,
      kycDetails: req.user.kycDetails,
    });
  } catch (err) {
    next(err);
  }
});

/* ─── Download generated policy document ─────────────── */
router.get("/policy-document/:purchaseId", authorize(["USER", "AGENT", "ADMIN"]), async (req, res, next) => {
  try {
    const purchase = (req.user.purchasedPolicies || []).find(
      (p) => String(p._id) === String(req.params.purchaseId),
    );
    if (!purchase || !purchase.policyDocumentPath) {
      return res.status(404).json({ message: "Policy document not found" });
    }

    const content = await fs.readFile(purchase.policyDocumentPath);
    const filename = purchase.policyDocumentPath.split(/[\\/]/).pop();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=\"${filename}\"`,
    );
    return res.send(content);
  } catch (err) {
    next(err);
  }
});

/* ─── Dependents CRUD ────────────────────────────────── */

/* Add a dependent */
router.post("/dependents", authorize(["USER"]), async (req, res, next) => {
  try {
    const { name, relationship, dateOfBirth, gender, healthConditions } =
      req.body;
    if (!name || !relationship) {
      return res
        .status(400)
        .json({ message: "Name and relationship are required" });
    }

    req.user.dependents.push({
      name,
      relationship,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      healthConditions: healthConditions || [],
    });
    req.user.numberOfDependents = req.user.dependents.length;
    await req.user.save();
    res.status(201).json(req.user.dependents);
  } catch (err) {
    next(err);
  }
});

/* Update a dependent */
router.put("/dependents/:depId", authorize(["USER"]), async (req, res, next) => {
  try {
    const dep = req.user.dependents.id(req.params.depId);
    if (!dep) return res.status(404).json({ message: "Dependent not found" });

    const allowed = [
      "name",
      "relationship",
      "dateOfBirth",
      "gender",
      "healthConditions",
      "isCovered",
      "coveredPolicyId",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) dep[field] = req.body[field];
    });

    await req.user.save();
    res.json(req.user.dependents);
  } catch (err) {
    next(err);
  }
});

/* Delete a dependent */
router.delete("/dependents/:depId", authorize(["USER"]), async (req, res, next) => {
  try {
    const dep = req.user.dependents.id(req.params.depId);
    if (!dep) return res.status(404).json({ message: "Dependent not found" });

    await dep.deleteOne();
    req.user.numberOfDependents = req.user.dependents.length;
    await req.user.save();
    res.json(req.user.dependents);
  } catch (err) {
    next(err);
  }
});

router.get("/agent/:agentId/customers", authorize(["AGENT", "ADMIN"]), async (req, res, next) => {
  try {
    if (
      req.user.role === "AGENT" &&
      String(req.user._id) !== String(req.params.agentId)
    ) {
      return next(new AppError("Agents can only view their own customers", 403));
    }

    const customers = await User.find({
      role: "USER",
      "user_profile.assigned_agent_id": req.params.agentId,
    })
      .select("fullName email mobileNumber user_profile purchasedPolicies createdAt")
      .populate("purchasedPolicies.policy", "policyId name company");

    res.json(customers);
  } catch (err) {
    next(err);
  }
});

export default router;
