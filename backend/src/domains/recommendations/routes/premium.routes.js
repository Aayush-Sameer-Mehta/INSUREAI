import { Router } from "express";
import validate from "../../../middleware/validate.js";
import { premiumCalculateSchema } from "../../../validators/advanced.validators.js";
import { calculatePremiumBreakdown } from "../services/premium.engine.js";
import { ok } from "../../shared/services/response.js";

const router = Router();

router.post("/calculate", validate(premiumCalculateSchema), async (req, res, next) => {
  try {
    const result = calculatePremiumBreakdown(req.body);
    return ok(res, result);
  } catch (err) {
    return next(err);
  }
});

export default router;

