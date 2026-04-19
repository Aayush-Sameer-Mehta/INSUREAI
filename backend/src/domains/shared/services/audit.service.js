import AuditEvent from "../models/AuditEvent.js";

export async function writeAuditEvent({
  eventType,
  actor = null,
  entityType,
  entityId,
  summary = "",
  metadata = {},
}) {
  try {
    await AuditEvent.create({
      eventType,
      actor,
      entityType,
      entityId: String(entityId),
      summary,
      metadata,
    });
  } catch {
    // Avoid blocking business flow for audit persistence failures.
  }
}

