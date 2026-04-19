import mongoose from "mongoose";

const coverageDetailSchema = new mongoose.Schema(
  { label: String, value: String },
  { _id: false },
);

const policySchema = new mongoose.Schema(
  {
    /* ── Identification ────────────────────────────── */
    policyId: { type: String, unique: true }, // maps to frontend "id"
    policy_number: { type: String, unique: true, sparse: true, index: true },
    product_code: { type: String, default: "", index: true },
    irdai_product_id: { type: String, default: "", index: true },

    name: { type: String, required: true },
    company: { type: String, required: true },
    company_id: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    price: { type: Number, required: true },
    coverage: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "car",
        "bike",
        "health",
        "life",
        "travel",
        "home",
        "motor_commercial",
        "liability",
        "business",
        "agriculture",
        "micro_social",
        "specialty",
        "personal_accident",
        "group",
      ],
    },
    segment: {
      type: String,
      enum: ["life", "health", "general", "reinsurance"],
      default: "general",
    },
    subtype: { type: String, default: "" },
    description: { type: String, default: "" },
    benefits: [String],
    coverageDetails: [coverageDetailSchema],
    premiumInfo: {
      basePremium: String,
      gst: String,
      discounts: String,
      paymentOptions: String,
    },
    financialTerms: {
      deductible: { type: Number, default: 0 },
      copayPercentage: { type: Number, default: 0 },
    },

    /* ── Lifecycle Management ────────────────────── */
    policy_status: {
      type: String,
      enum: ["Draft", "Active", "Expired", "Cancelled", "Lapsed", "Renewed"],
      default: "Draft",
      index: true,
    },
    issued_date: { type: Date },
    start_date: { type: Date },
    end_date: { type: Date },
    renewal_date: { type: Date },
    lapse_date: { type: Date },

    /* ── Financial Enhancements ──────────────────── */
    sum_insured_options: [
      {
        amount: { type: Number, default: 0 },
        premium: { type: Number, default: 0 },
        is_default: { type: Boolean, default: false },
      },
    ],
    premium_calculation_formula: { type: String, default: "" },
    loading_charges: { type: Number, default: 0, min: 0 },

    /* ── Underwriting (CRITICAL) ─────────────────── */
    underwriting_required: { type: Boolean, default: false, index: true },
    underwriting_decision: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Conditional"],
      default: "Pending",
      index: true,
    },
    underwriting_notes: { type: String, default: "" },
    underwriting_assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    underwriting_completed_at: { type: Date },
    medical_test_required: { type: Boolean, default: false },
    risk_class_assigned: {
      type: String,
      enum: ["Standard", "Preferred", "Non-Standard", "Declined"],
      default: "Standard",
    },
    availableRiders: [
      {
        name: String,
        price: Number,
      },
    ],
    policyTermYears: { type: Number, default: 1 },
    gracePeriodDays: { type: Number, default: 30 },
    taxBenefitSection: { type: String, default: "None" },
    eligibility: [String],
    termsAndConditions: [String],
    claimProcess: [String],
    score: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0 },
    claimSettlementRatio: { type: Number, default: 85 },
    waitingPeriodDays: { type: Number, default: 0 },
    networkCount: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    requiredDocumentTypes: [
      {
        type: String,
        enum: [
          "aadhaar",
          "pan",
          "driving_license",
          "vehicle_rc",
          "medical_report",
          "accident_photo",
          "other",
        ],
      },
    ],

    /* ── Status & Timestamps ─────────────────────── */
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* Virtual "id" to match frontend expectations */
policySchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret.policyId || ret._id;
    return ret;
  },
});

/* ── Indexing for Performance ────────────────────────── */
policySchema.index({ policy_number: 1, product_code: 1 });
policySchema.index({ company_id: 1, policy_status: 1 });
policySchema.index({ is_active: 1, policy_status: 1 });
policySchema.index({ underwriting_required: 1, underwriting_decision: 1 });
policySchema.index({ category: 1, segment: 1 });

export default mongoose.model("Policy", policySchema);
