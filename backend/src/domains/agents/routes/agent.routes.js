import { Router } from "express";
import auth from "../../../middleware/auth.js";
import authorize from "../../../middleware/authorize.js";
import AppError from "../../../utils/AppError.js";
import User from "../../users/models/User.js";
import Claim from "../../claims/models/Claim.js";
import Payment from "../../payments/models/Payment.js";
import { buildAgentDashboard } from "../../analytics/services/dashboard.service.js";

const router = Router();

router.use(auth, authorize(["AGENT", "ADMIN"]));

function normalizeCustomerWorkflow(customer = {}) {
  if (!customer.agent_workflow) {
    customer.agent_workflow = {};
  }

  customer.agent_workflow.status ||= "Active";
  customer.agent_workflow.priority ||= "Medium";
  customer.agent_workflow.preferredContactChannel ||= "Phone";
  customer.agent_workflow.onboardingStage ||= "Assigned";
  customer.agent_workflow.followUps ||= [];

  return customer;
}

router.get("/dashboard", async (req, res, next) => {
  try {
    const dashboard = await buildAgentDashboard(req.user._id);
    res.json(dashboard);
  } catch (err) {
    next(err);
  }
});

router.get("/customers", async (req, res, next) => {
  try {
    const customers = await User.find({
      role: "USER",
      "user_profile.assigned_agent_id": req.user._id,
    })
      .select(
        "fullName email mobileNumber city state communication_preference user_profile agent_workflow purchasedPolicies createdAt",
      )
      .populate("purchasedPolicies.policy", "policyId name company");

    res.json(customers.map((customer) => normalizeCustomerWorkflow(customer.toObject())));
  } catch (err) {
    next(err);
  }
});

router.get("/customers/:id", async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "USER",
      "user_profile.assigned_agent_id": req.user._id,
    })
      .select(
        [
          "fullName",
          "email",
          "mobileNumber",
          "city",
          "state",
          "preferred_language",
          "communication_preference",
          "occupation",
          "annualIncome",
          "dateOfBirth",
          "createdAt",
          "user_profile",
          "agent_workflow",
          "purchasedPolicies",
        ].join(" "),
      )
      .populate("purchasedPolicies.policy", "policyId name company category price coverage");

    if (!customer) {
      return next(new AppError("Assigned customer not found", 404));
    }

    const [claims, commissions, renewals] = await Promise.all([
      Claim.find({ user: customer._id, agent_id: req.user._id })
        .populate("policy", "policyId name company category")
        .sort({ createdAt: -1 })
        .limit(8),
      Payment.find({ user_id: customer._id, agent_id: req.user._id })
        .populate("policy_id", "policyId name company category")
        .sort({ createdAt: -1 })
        .limit(8),
      Payment.find({
        user_id: customer._id,
        renewal_agent_id: req.user._id,
      })
        .populate("policy_id", "policyId name company category")
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    res.json({
      customer: normalizeCustomerWorkflow(customer.toObject()),
      claims,
      commissions,
      renewals,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/customers", async (req, res, next) => {
  try {
    const { fullName, email, password, mobileNumber, city, state, user_profile = {} } = req.body;
    if (!fullName || !email || !password || !mobileNumber) {
      return next(new AppError("fullName, email, password, and mobileNumber are required", 400));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError("Email already registered", 409));
    }

    const customer = await User.create({
      fullName,
      email,
      password,
      mobileNumber,
      city,
      state,
      role: "USER",
      user_profile: {
        ...user_profile,
        assigned_agent_id: req.user._id,
      },
    });

    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

router.patch("/customers/:id", async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "USER",
      "user_profile.assigned_agent_id": req.user._id,
    });

    if (!customer) {
      return next(new AppError("Assigned customer not found", 404));
    }

    const allowed = ["fullName", "mobileNumber", "city", "state", "user_profile"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });

    if (req.body.user_profile) {
      customer.user_profile = {
        ...customer.user_profile?.toObject?.(),
        ...req.body.user_profile,
        assigned_agent_id: req.user._id,
      };
    }

    await customer.save();
    res.json(normalizeCustomerWorkflow(customer.toObject()));
  } catch (err) {
    next(err);
  }
});

router.patch("/customers/:id/workflow", async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "USER",
      "user_profile.assigned_agent_id": req.user._id,
    });

    if (!customer) {
      return next(new AppError("Assigned customer not found", 404));
    }

    const workflow = customer.agent_workflow?.toObject?.() || {};
    const allowed = [
      "status",
      "priority",
      "lastContactedAt",
      "nextFollowUpAt",
      "preferredContactChannel",
      "onboardingStage",
      "notes",
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        workflow[field] = req.body[field];
      }
    });

    customer.agent_workflow = {
      ...workflow,
      followUps: workflow.followUps || customer.agent_workflow?.followUps || [],
    };

    await customer.save();

    res.json({
      customer: normalizeCustomerWorkflow(customer.toObject()),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/customers/:id/follow-ups", async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "USER",
      "user_profile.assigned_agent_id": req.user._id,
    });

    if (!customer) {
      return next(new AppError("Assigned customer not found", 404));
    }

    const { dueAt, type, notes, outcome, status } = req.body;

    if (!dueAt) {
      return next(new AppError("dueAt is required", 400));
    }

    const workflow = customer.agent_workflow?.toObject?.() || {};
    const followUps = Array.isArray(workflow.followUps) ? workflow.followUps : [];

    followUps.unshift({
      dueAt,
      type: type || "Call",
      notes: notes || "",
      outcome: outcome || "",
      status: status || "Scheduled",
      createdBy: req.user._id,
      completedAt: status === "Completed" ? new Date() : null,
    });

    customer.agent_workflow = {
      ...workflow,
      status:
        workflow.status && workflow.status !== "New"
          ? workflow.status
          : "Needs Follow-Up",
      lastContactedAt:
        status === "Completed" ? new Date() : workflow.lastContactedAt || null,
      nextFollowUpAt:
        status === "Completed"
          ? workflow.nextFollowUpAt || null
          : dueAt,
      followUps,
    };

    await customer.save();

    res.status(201).json({
      customer: normalizeCustomerWorkflow(customer.toObject()),
      followUps: customer.agent_workflow.followUps,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/customers/:id/follow-ups/:followUpId", async (req, res, next) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: "USER",
      "user_profile.assigned_agent_id": req.user._id,
    });

    if (!customer) {
      return next(new AppError("Assigned customer not found", 404));
    }

    const workflow = customer.agent_workflow?.toObject?.() || {};
    const followUps = Array.isArray(workflow.followUps) ? workflow.followUps : [];
    const followUp = followUps.find((item) => String(item._id) === String(req.params.followUpId));

    if (!followUp) {
      return next(new AppError("Follow-up not found", 404));
    }

    ["dueAt", "type", "notes", "outcome", "status"].forEach((field) => {
      if (req.body[field] !== undefined) {
        followUp[field] = req.body[field];
      }
    });

    if (followUp.status === "Completed" && !followUp.completedAt) {
      followUp.completedAt = new Date();
    }

    customer.agent_workflow = {
      ...workflow,
      lastContactedAt:
        followUp.status === "Completed"
          ? followUp.completedAt || new Date()
          : workflow.lastContactedAt || null,
      followUps,
    };

    await customer.save();

    res.json({
      customer: normalizeCustomerWorkflow(customer.toObject()),
      followUps: customer.agent_workflow.followUps,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/claims", async (req, res, next) => {
  try {
    const claims = await Claim.find({ agent_id: req.user._id })
      .populate("user", "fullName email")
      .populate("policy", "policyId name company")
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    next(err);
  }
});

router.get("/commissions", async (req, res, next) => {
  try {
    const commissions = await Payment.find({ agent_id: req.user._id })
      .populate("user_id", "fullName email")
      .populate("policy_id", "policyId name")
      .sort({ createdAt: -1 });

    res.json(commissions);
  } catch (err) {
    next(err);
  }
});

export default router;
