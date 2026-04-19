const mongoose = require("mongoose");
const { Schema } = mongoose;

const LeadFollowUpSchema = new Schema(
  {
    lead: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
      index: true,
    },
    agent: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },
    // Follow-up Details
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    followupType: {
      type: String,
      enum: ["CALL", "EMAIL", "SMS", "MEETING", "WHATSAPP", "VIDEO_CALL"],
      required: true,
    },
    // Follow-up Content
    purpose: {
      type: String,
      enum: [
        "INITIAL_CONTACT",
        "NEEDS_ASSESSMENT",
        "PROPOSAL_DISCUSSION",
        "OBJECTION_HANDLING",
        "CLOSING",
        "UPSELL",
        "CUSTOMER_RETENTION",
        "OTHER",
      ],
      default: "INITIAL_CONTACT",
    },
    description: String,
    notes: String,
    // Status
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "MISSED", "RESCHEDULED", "CANCELLED"],
      default: "SCHEDULED",
    },
    completedAt: Date,
    // Outcome
    outcome: {
      type: String,
      enum: [
        "POSITIVE_RESPONSE",
        "NOT_INTERESTED",
        "NEEDS_MORE_INFO",
        "BUSY_ASK_LATER",
        "CONTACT_NOT_REACHABLE",
        "RESCHEDULED",
        "NOT_AVAILABLE",
      ],
    },
    outcomeNotes: String,
    // Follow-up Result
    resultingActions: [
      {
        action: String,
        dueDate: Date,
      },
    ],
    // Next Follow-up Suggested
    nextFollowupDue: Date,
    nextFollowupType: String,
    // Reminders
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: Date,
    reminderChannel: {
      type: String,
      enum: ["SMS", "EMAIL", "PUSH", "IN_APP"],
    },
    // Documents Attached
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: Date,
      },
    ],
    // Duration (for meetings/calls)
    duration: Number, // in minutes
    // Conversion Outcome
    leadConverted: { type: Boolean, default: false },
    policyConvertedTo: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      sparse: true,
    },
  },
  { timestamps: true },
);

LeadFollowUpSchema.index({ lead: 1, agent: 1 });
LeadFollowUpSchema.index({ agent: 1, scheduledFor: 1 });
LeadFollowUpSchema.index({ status: 1, scheduledFor: 1 });
LeadFollowUpSchema.index({ agent: 1, createdAt: -1 });

module.exports = mongoose.model("LeadFollowUp", LeadFollowUpSchema);
