import Notification from "../models/Notification.js";
import { sendEmail } from "./resend.adapter.js";
import { sendSms } from "./twilio.adapter.js";

export async function createNotification({
  userId,
  title,
  message,
  type = "system",
  entityType = "",
  entityId = "",
  channels = { inApp: true, email: false, sms: false },
  emailTo = "",
  smsTo = "",
}) {
  const notif = await Notification.create({
    user: userId,
    title,
    message,
    type,
    entityType,
    entityId: String(entityId || ""),
    channelsSent: {
      inApp: Boolean(channels.inApp),
      email: false,
      sms: false,
    },
  });

  if (channels.email && emailTo) {
    await sendEmail({
      to: emailTo,
      subject: title,
      html: `<p>${message}</p>`,
    });
    notif.channelsSent.email = true;
  }

  if (channels.sms && smsTo) {
    await sendSms({ to: smsTo, message: `${title}: ${message}` });
    notif.channelsSent.sms = true;
  }

  await notif.save();
  return notif;
}

