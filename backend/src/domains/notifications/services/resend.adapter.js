const EMAIL_MODE = process.env.EMAIL_PROVIDER_MODE || "mock";

export async function sendEmail({ to, subject, html }) {
  if (EMAIL_MODE === "mock") {
    return {
      provider: "mock-email",
      status: "sent",
      to,
      subject,
      preview: html?.slice(0, 140) || "",
    };
  }

  // Live adapter placeholder for Resend integration.
  return {
    provider: "resend",
    status: "queued",
    to,
    subject,
  };
}

