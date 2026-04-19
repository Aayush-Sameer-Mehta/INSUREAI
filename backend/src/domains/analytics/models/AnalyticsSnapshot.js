import mongoose from "mongoose";

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    period: { type: String, required: true, index: true },
    dateKey: { type: String, required: true, unique: true, index: true },
    metrics: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema);

