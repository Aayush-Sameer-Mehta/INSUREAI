import mongoose from "mongoose";

const reportJobSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scope: { type: String, enum: ["user", "admin"], required: true, index: true },
    reportType: {
      type: String,
      enum: ["claim_history", "payment_history", "policy_summary", "revenue_analytics"],
      required: true,
      index: true,
    },
    format: { type: String, enum: ["csv", "pdf", "xlsx"], required: true },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending", index: true },
    filters: { type: Object, default: {} },
    filePath: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("ReportJob", reportJobSchema);

