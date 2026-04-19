const mongoose = require("mongoose");
const { Schema } = mongoose;

const AgentKYCSchema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      unique: true,
    },
    // Personal Information
    panCard: {
      number: { type: String, unique: true, sparse: true },
      documentUrl: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING",
      },
    },
    aadhar: {
      number: { type: String, unique: true, sparse: true },
      documentUrl: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING",
      },
    },
    addressProof: {
      type: {
        type: String,
        enum: ["UTILITY_BILL", "RENTAL_AGREEMENT", "PROPERTY_TAX", "VOTER_ID"],
      },
      documentUrl: String,
      uploadedAt: Date,
      verifiedAt: Date,
      verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING",
      },
    },
    // Professional Information
    insuranceLicense: {
      licenseNumber: String,
      issuingAuthority: String,
      validFrom: Date,
      validUpto: Date,
      documentUrl: String,
      verificationStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED", "EXPIRED"],
        default: "PENDING",
      },
    },
    // Business Details
    agencyName: String,
    businessRegistration: {
      type: String,
      enum: ["SOLE_PROPRIETOR", "PARTNERSHIP", "COMPANY", "LLP"],
    },
    businessRegistrationNumber: String,
    gstNumber: String,
    // Verification Timeline
    overallStatus: {
      type: String,
      enum: ["PENDING_REVIEW", "APPROVED", "REJECTED", "EXPIRED"],
      default: "PENDING_REVIEW",
    },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectionReason: String,
    rejectedAt: Date,
    expiryDate: Date,
    // Background Check
    backgroundCheck: {
      status: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "CLEAR", "FLAG", "REJECTED"],
        default: "PENDING",
      },
      completedAt: Date,
      flaggedReasons: [String],
    },
    // Additional Fields
    additionalDocuments: [
      {
        documentType: String,
        documentUrl: String,
        uploadedAt: Date,
      },
    ],
    notes: String,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Admin user
    },
    approvalNotes: String,
  },
  { timestamps: true },
);

// Index for faster queries
AgentKYCSchema.index({ agent: 1 });
AgentKYCSchema.index({ overallStatus: 1 });
AgentKYCSchema.index({ approvedAt: 1 });

module.exports = mongoose.model("AgentKYC", AgentKYCSchema);
