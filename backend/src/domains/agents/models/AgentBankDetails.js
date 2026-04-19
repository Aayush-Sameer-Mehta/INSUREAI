const mongoose = require("mongoose");
const { Schema } = mongoose;

const AgentBankDetailsSchema = new Schema(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      unique: true,
    },
    bankName: {
      type: String,
      required: true,
      enum: [
        "HDFC Bank",
        "ICIC Bank",
        "SBI",
        "Axis Bank",
        "Kotak Mahindra",
        "YES Bank",
        "IndusInd Bank",
        "Federal Bank",
        "Canara Bank",
        "BOB",
        "Union Bank",
        "PNB",
        "Other",
      ],
    },
    accountNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{9,18}$/.test(v);
        },
        message: "Invalid account number",
      },
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      validate: {
        validator: function (v) {
          return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
        },
        message: "Invalid IFSC code format",
      },
    },
    accountType: {
      type: String,
      enum: ["SAVINGS", "CURRENT", "SALARY"],
      default: "SAVINGS",
    },
    // Verification
    isVerified: { type: Boolean, default: false },
    verificationOTP: String,
    otpExpiresAt: Date,
    verifiedAt: Date,
    // Mandate Setup (Optional - for auto payout)
    mandateStatus: {
      type: String,
      enum: ["NOT_SETUP", "PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "NOT_SETUP",
    },
    mandateId: String,
    mandateAmount: Number,
    mandateValidUpto: Date,
    // Document Upload
    bankProofDocument: {
      documentUrl: String,
      uploadedAt: Date,
    },
    // Additional Fields
    branchName: String,
    city: String,
    state: String,
    notes: String,
    // Change History
    previousDetails: [
      {
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        changedAt: Date,
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true },
);

AgentBankDetailsSchema.index({ agent: 1 });
AgentBankDetailsSchema.index({ isVerified: 1 });

module.exports = mongoose.model("AgentBankDetails", AgentBankDetailsSchema);
