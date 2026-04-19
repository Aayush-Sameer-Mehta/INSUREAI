import { Router } from "express";
import Policy from "../models/Policy.js";
import Review from "../models/Review.js";
import auth from "../../../middleware/auth.js";
import authorize from "../../../middleware/authorize.js";
import validate from "../../../middleware/validate.js";
import { compareSchema } from "../../../validators/recommendation.validators.js";
import { calculateCustomerRiskScore } from "../../recommendations/services/risk.engine.js";
import { calculatePremiumBreakdown } from "../../recommendations/services/premium.engine.js";
import { ok, fail } from "../../shared/services/response.js";
import { ERROR_CODES } from "../../shared/services/error-codes.js";

const router = Router();

/* ─── List policies (with optional filters) ──────────── */
router.get("/", async (req, res, next) => {
    try {
        const { search, company, category, priceMax, coverageMin } = req.query;
        const filter = {};

        if (category) filter.category = category.toLowerCase();
        if (company) {
            const safeCompany = company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.company = new RegExp(`^${safeCompany}$`, "i");
        }

        if (priceMax) filter.price = { $lte: Number(priceMax) };
        if (coverageMin)
            filter.coverage = { ...(filter.coverage || {}), $gte: Number(coverageMin) };

        if (search) {
            const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rx = new RegExp(safeSearch, "i");
            filter.$or = [{ name: rx }, { company: rx }, { description: rx }];
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        let sortCriteria = { score: -1 };
        if (req.query.sort === "price-asc") sortCriteria = { price: 1 };
        else if (req.query.sort === "price-desc") sortCriteria = { price: -1 };
        else if (req.query.sort === "coverage-desc") sortCriteria = { coverage: -1 };

        const [policies, totalCount] = await Promise.all([
            Policy.find(filter).sort(sortCriteria).skip(skip).limit(limit),
            Policy.countDocuments(filter),
        ]);

        res.json({
            policies,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Single policy by ID ────────────────────────────── */
router.get("/:id", async (req, res, next) => {
    try {
        // Try policyId first (frontend "fe-car-1" style), then MongoDB _id
        let policy =
            (await Policy.findOne({ policyId: req.params.id })) ||
            (await Policy.findById(req.params.id).catch(() => null));

        if (!policy) return res.status(404).json({ message: "Policy not found" });
        res.json(policy);
    } catch (err) {
        next(err);
    }
});

/* ─── Policy management for agents/admins ───────────── */
router.post("/", auth, authorize(["AGENT", "ADMIN"]), async (req, res, next) => {
    try {
        const policy = await Policy.create(req.body);
        res.status(201).json(policy);
    } catch (err) {
        next(err);
    }
});

router.put("/:id", auth, authorize(["AGENT", "ADMIN"]), async (req, res, next) => {
    try {
        const policy =
            (await Policy.findOne({ policyId: req.params.id })) ||
            (await Policy.findById(req.params.id).catch(() => null));

        if (!policy) return res.status(404).json({ message: "Policy not found" });

        Object.assign(policy, req.body);
        await policy.save();
        res.json(policy);
    } catch (err) {
        next(err);
    }
});

router.delete("/:id", auth, authorize(["ADMIN"]), async (req, res, next) => {
    try {
        const policy =
            (await Policy.findOne({ policyId: req.params.id })) ||
            (await Policy.findById(req.params.id).catch(() => null));

        if (!policy) return res.status(404).json({ message: "Policy not found" });

        await Policy.deleteOne({ _id: policy._id });
        res.json({ success: true, message: "Policy deleted successfully" });
    } catch (err) {
        next(err);
    }
});

/* ─── Get reviews for a policy ───────────────────────── */
router.get("/:id/reviews", async (req, res, next) => {
    try {
        const policy =
            (await Policy.findOne({ policyId: req.params.id })) ||
            (await Policy.findById(req.params.id).catch(() => null));

        if (!policy) return res.status(404).json({ message: "Policy not found" });

        const reviews = await Review.find({ policy: policy._id }).sort({
            createdAt: -1,
        });
        res.json(reviews);
    } catch (err) {
        next(err);
    }
});

/* ─── Submit a review ────────────────────────────────── */
router.post("/:id/reviews", auth, async (req, res, next) => {
    try {
        const policy =
            (await Policy.findOne({ policyId: req.params.id })) ||
            (await Policy.findById(req.params.id).catch(() => null));

        if (!policy) return res.status(404).json({ message: "Policy not found" });

        const { rating, comment } = req.body;
        if (!rating) return res.status(400).json({ message: "Rating is required" });

        const review = await Review.create({
            policy: policy._id,
            user: req.user.fullName,
            rating: Number(rating),
            comment: comment || "",
        });

        // Update aggregate rating on policy
        const allReviews = await Review.find({ policy: policy._id });
        policy.reviewsCount = allReviews.length;
        policy.ratingAverage =
            Math.round(
                (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) *
                10
            ) / 10;
        await policy.save();

        res.status(201).json(review);
    } catch (err) {
        next(err);
    }
});

/* ─── Advanced policy comparison ─────────────────────── */
router.post("/compare", validate(compareSchema), async (req, res, next) => {
    try {
        const { policyIds, userProfile } = req.body;
        const policies = await Policy.find({ policyId: { $in: policyIds } }).lean();
        if (policies.length < 2) {
            return fail(
                res,
                "At least two valid policies are required for comparison",
                ERROR_CODES.VALIDATION_FAILED,
                400
            );
        }

        const risk = calculateCustomerRiskScore(userProfile || {});
        const rows = policies.map((policy) => {
            const premium = calculatePremiumBreakdown({
                basePremium: policy.price,
                coverageAmount: policy.coverage,
                policyCoverage: policy.coverage,
                age: userProfile?.age || 30,
                riskScore: risk.score,
                smoking: Boolean(userProfile?.lifestyleHabits?.smoking),
                claimHistory: Number(userProfile?.claimStats?.totalClaims || 0),
                drivingHistory: userProfile?.drivingHistory || "good",
            });

            return {
                id: policy.policyId || policy._id,
                name: policy.name,
                company: policy.company,
                category: policy.category,
                coverage: policy.coverage,
                premium: premium.adjustedAnnualPremium,
                monthlyPremium: premium.monthlyPremium,
                claimSettlementRatio: policy.claimSettlementRatio || 0,
                benefits: policy.benefits || [],
                waitingPeriodDays: policy.waitingPeriodDays || 0,
                networkCount: policy.networkCount || 0,
                ratingAverage: policy.ratingAverage || 0,
            };
        });

        return ok(res, {
            riskProfile: risk,
            comparison: rows,
        });
    } catch (err) {
        return next(err);
    }
});

export default router;
