import { Router } from "express";
import auth from "../../../middleware/auth.js";
import Notification from "../models/Notification.js";
import { ok, fail } from "../../shared/services/response.js";
import { ERROR_CODES } from "../../shared/services/error-codes.js";

const router = Router();

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return ok(res, notifications);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id/read", async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notif) {
      return fail(res, "Notification not found", ERROR_CODES.NOT_FOUND, 404);
    }
    notif.readAt = new Date();
    await notif.save();
    return ok(res, notif);
  } catch (err) {
    return next(err);
  }
});

export default router;

