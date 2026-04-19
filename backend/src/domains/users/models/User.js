import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES, ROLES, normalizeRole } from "../../../utils/roles.js";

/* ─── Sub-schema: purchased policy ───────────────────── */
const purchaseSchema = new mongoose.Schema(
  {
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" },
    amount: { type: Number, required: true },
    purchasedAt: { type: Date, default: Date.now },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    paymentMethod: { type: String, default: "upi" },
    paymentReference: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Failed"],
      default: "Paid",
    },
    policyDocumentPath: { type: String, default: "" },
    agent_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    commission_percentage: { type: Number, default: 0, min: 0, max: 100 },
    commission_amount: { type: Number, default: 0, min: 0 },
    commission_status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    renewal_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    auto_renewal_flag: { type: Boolean, default: false },
    renewal_status: {
      type: String,
      enum: ["Not Due", "Pending", "In Progress", "Completed", "Cancelled"],
      default: "Not Due",
    },
    ai_score: { type: Number, default: 0, min: 0, max: 100 },
    agent_score: { type: Number, default: 0, min: 0, max: 100 },
    final_recommendation_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    recommendation_source: {
      type: String,
      enum: ["AI", "Agent", "Hybrid"],
      default: "AI",
    },
  },
  { _id: true },
);

const userProfileSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 0 },
    income: { type: Number, default: 0, min: 0 },
    risk_profile: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assigned_agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { _id: false },
);

const agentDetailsSchema = new mongoose.Schema(
  {
    license_number: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },
    commission_percentage: { type: Number, default: 0, min: 0, max: 100 },
    region: {
      type: String,
      enum: [
        "North",
        "South",
        "East",
        "West",
        "Central",
        "Northeast",
        "Pan-India",
      ],
      default: "Pan-India",
    },
    total_commission_earned: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const agentFollowUpSchema = new mongoose.Schema(
  {
    dueAt: { type: Date, required: true },
    type: {
      type: String,
      enum: ["Call", "Email", "WhatsApp", "Meeting", "Renewal", "Document", "Other"],
      default: "Call",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Missed", "Cancelled"],
      default: "Scheduled",
      index: true,
    },
    outcome: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date, default: null },
  },
  { _id: true, timestamps: true },
);

const agentWorkflowSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["New", "Active", "Needs Follow-Up", "At Risk", "Converted", "Dormant"],
      default: "Active",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    lastContactedAt: { type: Date, default: null },
    nextFollowUpAt: { type: Date, default: null, index: true },
    preferredContactChannel: {
      type: String,
      enum: ["Phone", "Email", "WhatsApp", "SMS"],
      default: "Phone",
    },
    onboardingStage: {
      type: String,
      enum: ["Assigned", "Contacted", "Qualified", "Proposal Shared", "Converted"],
      default: "Assigned",
    },
    notes: { type: String, default: "", trim: true },
    followUps: { type: [agentFollowUpSchema], default: [] },
  },
  { _id: false },
);

/* ─── Main User Schema ───────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    /* ── Account ─────────────────────────────────── */
    fullName: { type: String, required: true, trim: true, alias: "name" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.USER,
      set: normalizeRole,
      index: true,
    },
    isBlocked: { type: Boolean, default: false, index: true },
    blockedAt: { type: Date },
    blockReason: { type: String, default: "", trim: true },
    mobileNumber: { type: String, trim: true, alias: "phone" },
    is_active: { type: Boolean, default: true, index: true },
    user_profile: { type: userProfileSchema, default: () => ({}) },
    agent_workflow: { type: agentWorkflowSchema, default: () => ({}) },
    agent_details: { type: agentDetailsSchema, default: () => ({}) },
    admin_permissions: [{ type: String, trim: true }],

    /* ── Personal Details ────────────────────────── */
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    occupation: { type: String, default: "", trim: true },
    annualIncome: { type: Number, default: 0 },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
      default: "Single",
    },
    numberOfDependents: { type: Number, default: 0 },
    dependents: [
      {
        name: { type: String, required: true, trim: true },
        relationship: {
          type: String,
          enum: ["Spouse", "Child", "Parent", "Sibling", "Other"],
          required: true,
        },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["Male", "Female", "Other"] },
        healthConditions: [{ type: String }],
        isCovered: { type: Boolean, default: false },
        coveredPolicyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Policy",
        },
      },
    ],
    lifestyleHabits: {
      smoking: { type: Boolean, default: false },
      drinking: { type: Boolean, default: false },
    },
    medicalHistory: {
      existingDiseases: [{ type: String }],
      familyMedicalHistory: [{ type: String }],
      pastSurgeries: [{ type: String }],
      bmi: { type: Number, default: 0 },
    },
    existingInsurance: { type: String, default: "" },
    riskAppetite: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    occupationRiskClass: {
      type: String,
      enum: ["Low", "Moderate", "High"],
      default: "Low",
      index: true,
    },
    drivingProfile: {
      vehicleType: {
        type: String,
        enum: ["none", "car", "bike", "both"],
        default: "none",
      },
      yearsOfDriving: { type: Number, default: 0 },
      accidentsLast3Years: { type: Number, default: 0 },
      trafficViolationsLast3Years: { type: Number, default: 0 },
    },
    claimStats: {
      totalClaims: { type: Number, default: 0 },
      approvedClaims: { type: Number, default: 0 },
      rejectedClaims: { type: Number, default: 0 },
    },
    riskProfileSnapshot: {
      score: { type: Number, default: 0 },
      category: {
        type: String,
        enum: ["Low Risk", "Moderate Risk", "High Risk"],
        default: "Low Risk",
      },
      updatedAt: { type: Date },
      factors: { type: Object, default: {} },
    },

    /* ── Address & Location ──────────────────────── */
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    addressInfo: {
      billingAddress: { type: String, default: "" },
      permanentAddress: { type: String, default: "" },
    },

    /* ── KYC Details ─────────────────────────────── */
    customer_id: { type: String, unique: true, sparse: true, index: true },
    kycDetails: {
      panCardNumber: { type: String, default: "", trim: true, uppercase: true },
      aadhaarNumber: { type: String, default: "", trim: true },
      isKycVerified: { type: Boolean, default: false },
    },
    kyc_verification_date: { type: Date },
    kyc_document_uploads: [
      {
        document_type: { type: String, default: "" },
        file_url: { type: String, default: "" },
        uploaded_at: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
      },
    ],
    aml_flag: { type: Boolean, default: false, index: true },
    pep_flag: { type: Boolean, default: false, index: true },

    /* ── Nominee ─────────────────────────────────── */
    nomineeName: { type: String, default: "", trim: true },
    nomineeRelation: { type: String, default: "", trim: true },
    nomineeAge: { type: Number },

    /* ── Financial Profile ──────────────────────── */
    credit_score: { type: Number, min: 300, max: 900 },
    liabilities: {
      home_loan: { type: Number, default: 0, min: 0 },
      auto_loan: { type: Number, default: 0, min: 0 },
      personal_loan: { type: Number, default: 0, min: 0 },
      credit_card_debt: { type: Number, default: 0, min: 0 },
      other_liabilities: { type: Number, default: 0, min: 0 },
      total_liabilities: { type: Number, default: 0, min: 0 },
    },
    savings_amount: { type: Number, default: 0, min: 0 },
    investment_experience: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner",
    },

    /* ── Contact & Language Preferences ────────── */
    alternate_phone_number: { type: String, default: "", trim: true },
    preferred_language: {
      type: String,
      enum: [
        "English",
        "Hindi",
        "Tamil",
        "Telugu",
        "Kannada",
        "Malayalam",
        "Marathi",
        "Gujarati",
        "Bengali",
        "Punjabi",
      ],
      default: "English",
    },
    communication_preference: {
      type: String,
      enum: ["Email", "SMS", "WhatsApp", "Phone", "All"],
      default: "Email",
      index: true,
    },

    /* ── Behavioral Tracking (for AI) ────────────── */
    login_history: [
      {
        login_time: { type: Date, default: Date.now },
        device_info: { type: String, default: "" },
        ip_address: { type: String, default: "" },
        login_status: {
          type: String,
          enum: ["Success", "Failed"],
          default: "Success",
        },
      },
    ],
    search_history: [
      {
        query: { type: String, default: "" },
        search_time: { type: Date, default: Date.now },
        category: { type: String, default: "" },
        results_clicked: { type: Number, default: 0 },
      },
    ],
    viewed_policies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Policy" }],
    click_behavior: {
      policy_detail_clicks: { type: Number, default: 0 },
      buy_button_clicks: { type: Number, default: 0 },
      comparison_clicks: { type: Number, default: 0 },
      claim_button_clicks: { type: Number, default: 0 },
      policy_share_clicks: { type: Number, default: 0 },
    },
    session_duration: [
      {
        session_start: { type: Date, default: Date.now },
        session_end: { type: Date },
        duration_minutes: { type: Number, default: 0 },
        pages_visited: [{ type: String }],
      },
    ],

    /* ── Tokens / Reset ──────────────────────────── */
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    /* ── Policies ────────────────────────────────── */
    purchasedPolicies: [purchaseSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/* ─── Virtual: age (auto-calculated from dateOfBirth) ── */
userSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const dob = new Date(this.dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual("created_at").get(function () {
  return this.createdAt;
});

userSchema.virtual("updated_at").get(function () {
  return this.updatedAt;
});

/* ─── Hash password before save ──────────────────────── */
userSchema.pre("save", async function (next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const dob = new Date(this.dateOfBirth);
    let computedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      computedAge--;
    }
    this.user_profile.age = computedAge;
  }

  if (typeof this.annualIncome === "number") {
    this.user_profile.income = this.annualIncome;
  }

  if (this.riskAppetite) {
    this.user_profile.risk_profile = this.riskAppetite;
  }

  if (this.role === ROLES.AGENT && !this.agent_details.license_number) {
    return next(
      new Error("Agent license number is required for users with AGENT role"),
    );
  }

  if (this.role !== ROLES.AGENT) {
    this.agent_details = {
      license_number: undefined,
      commission_percentage: 0,
      region: "Pan-India",
      total_commission_earned: 0,
    };
  }

  if (this.role !== ROLES.ADMIN) {
    this.admin_permissions = [];
  }

  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/* ─── Compare passwords ─────────────────────────────── */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* ─── Strip sensitive fields from JSON ───────────────── */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

/* ─── Indexes for role-aware access ──────────────────── */
userSchema.index({ email: 1, role: 1 });
userSchema.index({ "user_profile.assigned_agent_id": 1, role: 1 });
userSchema.index({ role: 1, is_active: 1 });

export default mongoose.model("User", userSchema);
