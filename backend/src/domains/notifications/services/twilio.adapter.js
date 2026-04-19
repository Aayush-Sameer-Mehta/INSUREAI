const SMS_MODE = process.env.SMS_PROVIDER_MODE || "mock";

export async function sendSms({ to, message }) {
  if (SMS_MODE === "mock") {
    return {
      provider: "mock-sms",
      status: "sent",
      to,
      messagePreview: message?.slice(0, 120) || "",
    };
  }

  // Live adapter placeholder for Twilio integration.
  return {
    provider: "twilio",
    status: "queued",
    to,
  };
}

