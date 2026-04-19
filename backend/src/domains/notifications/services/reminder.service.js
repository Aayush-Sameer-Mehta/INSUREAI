import RenewalReminderJob from "../models/RenewalReminderJob.js";
import User from "../../users/models/User.js";
import { createNotification } from "./notification.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function scheduleRenewalRemindersForUser(user) {
  const now = new Date();
  const jobs = [];
  for (const purchase of user.purchasedPolicies || []) {
    if (!purchase.validTo) continue;
    const validTo = new Date(purchase.validTo);
    for (const days of [30, 7, 1]) {
      const remindOn = new Date(validTo.getTime() - days * DAY_MS);
      if (remindOn < now) continue;
      jobs.push({
        user: user._id,
        policy: purchase.policy,
        purchasedPolicyId: String(purchase._id),
        remindOn,
        reminderDaysBefore: days,
      });
    }
  }
  if (jobs.length) {
    await RenewalReminderJob.insertMany(jobs, { ordered: false }).catch(() => {});
  }
  return jobs.length;
}

export async function runRenewalReminderProcessor() {
  const now = new Date();
  const due = await RenewalReminderJob.find({
    status: "Scheduled",
    remindOn: { $lte: now },
  })
    .populate("user", "email mobileNumber")
    .populate("policy", "name");

  for (const job of due) {
    try {
      await createNotification({
        userId: job.user._id,
        title: "Policy renewal reminder",
        message: `${job.policy?.name || "Your policy"} expires in ${job.reminderDaysBefore} day(s).`,
        type: "renewal",
        entityType: "policy",
        entityId: job.policy?._id || "",
        channels: { inApp: true, email: true, sms: true },
        emailTo: job.user.email,
        smsTo: job.user.mobileNumber,
      });
      job.status = "Sent";
      job.sentAt = new Date();
    } catch (err) {
      job.status = "Failed";
      job.errorMessage = err.message;
    }
    await job.save();
  }

  return due.length;
}

export async function scheduleRenewalRemindersForAllUsers() {
  const users = await User.find({ "purchasedPolicies.0": { $exists: true } })
    .select("purchasedPolicies");
  let count = 0;
  for (const user of users) {
    count += await scheduleRenewalRemindersForUser(user);
  }
  return count;
}

