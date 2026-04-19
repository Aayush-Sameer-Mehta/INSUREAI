import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      required: true,
      enum: [
        "aadhaar",
        "pan",
        "driving_license",
        "vehicle_rc",
        "medical_report",
        "accident_photo",
        "other",
      ],
      index: true,
    },
    document_type_category: {
      type: String,
      enum: ["Identity", "Financial", "Medical", "Vehicle", "Claim", "Other"],
      default: "Other",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", index: true },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      index: true,
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    checksum: { type: String, required: true, index: true },
    storageProvider: { type: String, default: "mock" },
    storageKey: { type: String, required: true },
    publicUrl: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
      index: true,
    },
    document_verification_status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    verificationRemarks: { type: String, default: "" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    expiry_date: { type: Date },
    isDuplicate: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ── Indexing for Performance ────────────────────────── */
documentSchema.index({ owner: 1, documentType: 1 });
documentSchema.index({ claim: 1, policy: 1 });
documentSchema.index({ is_active: 1, document_verification_status: 1 });

export default mongoose.model("Document", documentSchema);
