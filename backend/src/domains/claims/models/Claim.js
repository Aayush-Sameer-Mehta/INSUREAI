import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    claimId: { type: String, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
      index: true,
    },
    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    handled_by_agent: { type: Boolean, default: false },
    agent_assisted: { type: Boolean, default: false },
    approval_status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    claimAmount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    incidentDate: { type: Date, required: true },
    hospitalDetails: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      isNetworkHospital: { type: Boolean, default: false },
      contact_phone: { type: String, default: "" },
      contact_email: { type: String, default: "" },
    },
    garage_details: {
      name: { type: String, default: "" },
      address: { type: String, default: "" },
      contact_phone: { type: String, default: "" },
      contact_email: { type: String, default: "" },
      is_network_garage: { type: Boolean, default: false },
    },
    financialSettlement: {
      requestedAmount: { type: Number, default: 0 },
      approvedAmount: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
      payoutBankDetails: {
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
      },
    },

    /* ── Surveyor & Investigation Information ─────── */
    surveyor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    surveyorDetails: {
      assignedSurveyorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      remarks: { type: String, default: "" },
    },
    investigation_report: { type: String, default: "" },
    investigation_status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "Awaiting Details"],
      default: "Not Started",
      index: true,
    },
    documents: [{ type: String }],
    documentRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Approved", "Rejected", "Paid"],
      default: "Submitted",
      index: true,
    },
    workflowTimeline: [
      {
        status: {
          type: String,
          enum: ["Submitted", "Under Review", "Approved", "Rejected", "Paid"],
        },
        note: { type: String, default: "" },
        at: { type: Date, default: Date.now },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    fraudRiskScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    fraudRiskLevel: {
      type: String,
      enum: ["Low Risk", "Medium Risk", "High Risk"],
      default: "Low Risk",
      index: true,
    },
    fraud_score: { type: Number, min: 0, max: 100, default: 0 },
    fraudSignals: [{ type: String }],
    fraud_flags: [
      {
        flag_type: { type: String, default: "" },
        flag_description: { type: String, default: "" },
        flagged_at: { type: Date, default: Date.now },
        severity: {
          type: String,
          enum: ["Low", "Medium", "High"],
          default: "Low",
        },
      },
    ],
    requiresFraudReview: { type: Boolean, default: false, index: true },
    locationMismatch: { type: Boolean, default: false },
    geoLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String, default: "" },
      reportedAt: { type: Date },
    },

    /* ── Timeline Tracking ──────────────────────── */
    claim_intimation_date: { type: Date, default: Date.now },
    document_submission_date: { type: Date },
    processing_start_date: { type: Date },
    processing_end_date: { type: Date },
    turnaround_time: { type: Number, default: 0 }, // in days
    paymentState: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Failed"],
      default: "Pending",
      index: true,
    },
    adminRemarks: { type: String, default: "", trim: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

claimSchema.pre("validate", function (next) {
  if (!this.claimId) {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.claimId = `CLM-${stamp}-${random}`;
  }
  if (
    !Array.isArray(this.workflowTimeline) ||
    this.workflowTimeline.length === 0
  ) {
    this.workflowTimeline = [
      {
        status: this.status || "Submitted",
        note: "Claim created",
        at: new Date(),
        actor: this.user,
      },
    ];
  }
  next();
});

/* ── Indexing for Performance ────────────────────────── */
claimSchema.index({ user: 1, policy: 1 });
claimSchema.index({ agent_id: 1, approval_status: 1 });
claimSchema.index({ is_active: 1, status: 1 });
claimSchema.index({ investigation_status: 1, surveyor_id: 1 });
claimSchema.index({ fraud_score: 1, requiresFraudReview: 1 });
claimSchema.index({ claim_intimation_date: -1, processing_end_date: 1 });

export default mongoose.model("Claim", claimSchema);
