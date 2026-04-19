const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeadSchema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },
    // Lead Information
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    phone: {
      countryCode: {
        type: String,
        default: "+91",
      },
      number: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^[0-9]{10}$/.test(v);
          },
          message: "Invalid phone number",
        },
      },
    },
    // Lead Details
    productInterest: {
      type: String,
      enum: [
        "TERM_LIFE",
        "WHOLE_LIFE",
        "ENDOWMENT",
        "ULIP",
        "HEALTH",
        "CRITICAL_ILLNESS",
        "MOTOR",
        "HOME",
        "TRAVEL",
        "BUSINESS",
        "OTHER",
      ],
      required: true,
    },
    leadSource: {
      type: String,
      enum: [
        "WEBSITE",
        "REFERRAL",
        "COLD_CALL",
        "EMAIL_CAMPAIGN",
        "EVENT",
        "ADVERTISEMENT",
        "SOCIAL_MEDIA",
        "DIRECT_WALK_IN",
        "PARTNER",
        "OTHER",
      ],
      default: "DIRECT_WALK_IN",
    },
    // Lead Status Workflow
    status: {
      type: String,
      enum: [
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "PROPOSAL_SENT",
        "NEGOTIATION",
        "CONVERTED",
        "LOST",
        "ON_HOLD",
      ],
      default: "NEW",
      index: true,
    },
    // Status Progression Timestamps
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    // Lead Qualification
    qualificationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    qualificationRemarks: String,
    // Contact Journal
    notes: [
      {
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: "Agent",
        },
        content: String,
        type: {
          type: String,
          enum: ["NOTE", "CALL", "EMAIL", "SMS", "MEETING"],
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    // Demographics
    age: Number,
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    maritalStatus: {
      type: String,
      enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
    },
    dependents: Number,
    // Professional Info
    occupation: String,
    company: String,
    annualIncome: Number,
    employmentType: {
      type: String,
      enum: ["SALARIED", "SELF_EMPLOYED", "BUSINESS", "STUDENT", "RETIRED"],
    },
    // Address
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    // Policy Interest Details
    preferredPolicyDetails: {
      coverageAmount: Number,
      premiumBudget: Number,
      policyTerm: Number,
      annualOrMonthly: {
        type: String,
        enum: ["ANNUAL", "MONTHLY"],
      },
    },
    // Conversion Tracking
    isConverted: { type: Boolean, default: false },
    convertedPolicy: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      sparse: true,
    },
    convertedAt: Date,
    conversionValue: Number, // Policy premium value
    // Follow-up Scheduling
    nextFollowUp: Date,
    followUpUrgency: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    // Lead Quality Score (AI)
    leadScore: {
      probability: Number, // 0-100 conversion probability
      scoredAt: Date,
      scoringModel: String,
    },
    // Attachments & Documents
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    // Bulk Upload Tracking
    bulkUploadBatch: {
      type: Schema.Types.ObjectId,
      ref: "BulkUpload",
      sparse: true,
    },
    // Lifecycle
    lastContactedAt: Date,
    daysInCurrentStatus: Number,
    isActive: { type: Boolean, default: true },
    archivedAt: Date,
    archivedReason: String,
  },
  { timestamps: true },
);

// Compound indexes for better query performance
LeadSchema.index({ agent: 1, status: 1 });
LeadSchema.index({ agent: 1, createdAt: -1 });
LeadSchema.index({ agent: 1, isConverted: 1 });
LeadSchema.index({ agent: 1, nextFollowUp: 1 });
LeadSchema.index({ phone: 1 }, { sparse: true });
LeadSchema.index({ email: 1 }, { sparse: true });

// Virtual for full name
LeadSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to update status history
LeadSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("Lead", LeadSchema);
