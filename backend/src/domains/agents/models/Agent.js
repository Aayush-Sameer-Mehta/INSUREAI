import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    // Link to User (Authentication)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* ── Agent Identification ────────────────────────── */
    agent_id: { type: String, required: true, unique: true, index: true },
    agent_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    license_number: { type: String, required: true, unique: true, index: true },

    /* ── Personal Information ────────────────────────– */
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    profilePicture: String,

    /* ── Contact Details ─────────────────────────────– */
    phone: {
      countryCode: { type: String, default: "+91" },
      number: String,
    },
    contact_details: {
      phone: { type: String, required: true, trim: true },
      alternate_phone: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    /* ── Agency Information ──────────────────────────– */
    agencyName: String,
    businessType: {
      type: String,
      enum: ["SOLE_PROPRIETOR", "PARTNERSHIP", "COMPANY", "LLP"],
    },
    yearsOfExperience: Number,

    /* ── KYC Status ──────────────────────────────────– */
    kycStatus: {
      type: String,
      enum: ["PENDING", "SUBMITTED", "VERIFIED", "REJECTED", "EXPIRED"],
      default: "PENDING",
      index: true,
    },
    kyc_verified: { type: Boolean, default: false },
    kycDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentKYC",
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AgentBankDetails",
    },

    /* ── Commission & Performance ────────────────────– */
    commission_percentage: { type: Number, required: true, min: 0, max: 100 },
    total_commission_earned: { type: Number, default: 0, min: 0 },
    pendingCommission: { type: Number, default: 0, min: 0 },
    totalPayoutsReceived: { type: Number, default: 0, min: 0 },

    /* ── Coverage Information ────────────────────────– */
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
      index: true,
    },
    service_areas: [{ type: String }],

    /* ── Sales & Relationship ────────────────────────– */
    policies_sold: [{ type: mongoose.Schema.Types.ObjectId, ref: "Policy" }],
    total_policies_sold: { type: Number, default: 0 },
    total_clients: { type: Number, default: 0 },
    active_clients: { type: Number, default: 0 },
    total_premium_generated: { type: Number, default: 0, min: 0 },
    policies_lapsed: { type: Number, default: 0 },
    renewal_ratio: { type: Number, default: 0, min: 0, max: 100 },

    /* ── Lead Metrics ────────────────────────────────– */
    totalLeads: { type: Number, default: 0 },
    convertedLeads: { type: Number, default: 0 },
    leadConversionRate: { type: Number, default: 0 },

    /* ── Manager & Approval ──────────────────────────– */
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },

    /* ── Performance Tier ────────────────────────────– */
    performanceTier: {
      type: String,
      enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM"],
      default: "BRONZE",
    },
    performanceScore: { type: Number, default: 0, min: 0, max: 100 },

    /* ── Status & Compliance ─────────────────────────– */
    status: {
      type: String,
      enum: [
        "PENDING_APPROVAL",
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
        "TERMINATED",
      ],
      default: "PENDING_APPROVAL",
      index: true,
    },
    license_expiry_date: { type: Date },
    aml_flag: { type: Boolean, default: false },
    compliance_status: {
      type: String,
      enum: ["Compliant", "Non-Compliant", "Under Review"],
      default: "Compliant",
    },
    is_active: { type: Boolean, default: false, index: true },

    /* ── Approval Workflow ───────────────────────────– */
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalDate: Date,
    rejectionReason: String,
    rejectedAt: Date,

    /* ── Performance Metrics ─────────────────────────– */
    average_rating: { type: Number, default: 0, min: 0, max: 5 },
    customer_complaints: { type: Number, default: 0 },
    last_activity_date: { type: Date },
    last_login: Date,

    /* ── Notification & Communication ────────────────– */
    notificationPreferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },

    /* ── Additional Fields ───────────────────────────– */
    tags: [String],
    notes: String,

    /* ── Timestamps ──────────────────────────────────– */
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

/* ── Indexing for Performance ────────────────────────– */
agentSchema.index({ agent_id: 1, license_number: 1 });
agentSchema.index({ is_active: 1, status: 1 });
agentSchema.index({ region: 1, status: 1 });
agentSchema.index({ kycStatus: 1 });
agentSchema.index({ performanceTier: 1 });
agentSchema.index({ email: 1, phone: 1 });

export default mongoose.model("Agent", agentSchema);
