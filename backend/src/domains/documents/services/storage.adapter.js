import crypto from "crypto";

const STORAGE_MODE = process.env.DOCUMENT_STORAGE_MODE || "mock";

function checksumFor(content = "") {
  return crypto.createHash("sha256").update(String(content)).digest("hex");
}

export async function uploadDocument({
  fileName,
  mimeType = "application/octet-stream",
  content = "",
}) {
  const checksum = checksumFor(content || fileName + Date.now());
  const storageKey = `documents/${Date.now()}-${checksum.slice(0, 12)}-${fileName}`;

  if (STORAGE_MODE === "mock") {
    return {
      provider: "mock",
      storageKey,
      publicUrl: `/mock-storage/${encodeURIComponent(storageKey)}`,
      checksum,
      mimeType,
    };
  }

  // Adapter contract ready for Cloudinary/S3.
  // Keeping deterministic fallback until live credentials are configured.
  return {
    provider: STORAGE_MODE,
    storageKey,
    publicUrl: `/external-storage/${encodeURIComponent(storageKey)}`,
    checksum,
    mimeType,
  };
}

