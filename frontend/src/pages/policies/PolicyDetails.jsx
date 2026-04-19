import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
 ArrowLeft,
 Car,
 Bike,
 HeartPulse,
 Shield,
 Plane,
 Home as HomeIcon,
 Star,
 CheckCircle2,
 IndianRupee,
 FileText,
 UserCheck,
 Scale,
 ClipboardList,
 ShoppingCart,
 ChevronDown,
 ChevronUp,
 Stethoscope,
 Building2,
} from "lucide-react";
import Loader from "../../components/Loader";
import { useAuth } from "../../hooks/useAuth";
import {
 fetchPolicyById,
 fetchPolicyReviews,
 submitPolicyReview,
} from "../../services/policyService";

import { formatCurrency, toTitleCase } from "../../utils/formatters";

/* ─── category styling map ───────────────────────────── */
const CAT = {
 car: { icon: Car, gradient: "from-blue-500 to-blue-700", light: "bg-blue-50 text-blue-700 " },
 bike: { icon: Bike, gradient: "from-emerald-500 to-emerald-700", light: "bg-emerald-50 text-emerald-700 " },
 health: { icon: HeartPulse, gradient: "from-rose-500 to-rose-700", light: "bg-rose-50 text-rose-700 " },
 life: { icon: Shield, gradient: "from-violet-500 to-violet-700", light: "bg-violet-50 text-violet-700 " },
 travel: { icon: Plane, gradient: "from-amber-500 to-amber-700", light: "bg-amber-50 text-amber-700 " },
 home: { icon: HomeIcon, gradient: "from-cyan-500 to-cyan-700", light: "bg-cyan-50 text-cyan-700 " },
 personal_accident: { icon: Stethoscope, gradient: "from-red-500 to-red-700", light: "bg-red-50 text-red-700 " },
 group: { icon: Building2, gradient: "from-sky-500 to-sky-700", light: "bg-sky-50 text-sky-700 " },
};

/* ─── collapsible section component ──────────────────── */
function Section({ icon: Icon, title, defaultOpen = true, children }) {
 const [open, setOpen] = useState(defaultOpen);
 return (
 <section
 className="rounded-2xl border border-slate-200 bg-white shadow-sm "
 >
 <button
 type="button"
 onClick={() => setOpen((p) => !p)}
 className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 text-left transition hover:bg-slate-50 "
 >
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ">
 <Icon className="h-4.5 w-4.5" />
 </div>
 <h2 className="flex-1 text-lg font-semibold text-slate-900 ">{title}</h2>
 {open ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
 </button>
 <div
 className="overflow-hidden"
 >
 <div className="border-t border-slate-100 px-4 py-4 sm:px-6 sm:py-5 ">
 {children}
 </div>
 </div>
 </section>
 );
}

/* ═══════════════════════════════════════════════════════ */
export default function PolicyDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { isAuthenticated } = useAuth();
 const [policy, setPolicy] = useState(null);
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [reviewInput, setReviewInput] = useState({ rating: 5, comment: "" });

 useEffect(() => {
 const load = async () => {
 setLoading(true);
 try {
 const [policyData, reviewData] = await Promise.all([
 fetchPolicyById(id),
 fetchPolicyReviews(id),
 ]);
 setPolicy(policyData);
 setReviews(reviewData);
 } finally {
 setLoading(false);
 }
 };
 load();
 }, [id]);

 const cat = CAT[policy?.category] || CAT.life;
 const CatIcon = cat.icon;

 const reviewSummary = useMemo(
 () => `${Number(policy?.ratingAverage || 0).toFixed(1)}`,
 [policy],
 );

 const handlePurchase = () => {
 if (!isAuthenticated) {
 toast.error("Please login to purchase a policy");
 navigate("/login");
 return;
 }
 navigate(`/payment/${id}`);
 };

 const handleReview = async (event) => {
 event.preventDefault();
 if (!isAuthenticated) {
 toast.error("Login required to submit review");
 return;
 }
 try {
 await submitPolicyReview(id, reviewInput);
 const latestReviews = await fetchPolicyReviews(id);
 setReviews(latestReviews);
 setReviewInput({ rating: 5, comment: "" });
 toast.success("Review submitted!");
 } catch {
 toast.error("Review submission failed");
 }
 };

 if (loading) return <Loader />;
 if (!policy) {
 return (
 <div className="flex flex-col items-center justify-center py-20 text-center">
 <Shield className="mb-4 h-16 w-16 text-slate-300" />
 <h2 className="text-2xl font-bold text-slate-700 ">Policy Not Found</h2>
 <p className="mt-2 text-slate-500">The policy you're looking for doesn't exist.</p>
 <Link to="/policies" className="btn-primary mt-6">Browse Policies</Link>
 </div>
 );
 }

 return (
 <div className="space-y-6 pb-24 sm:pb-10">
 {/* ─── BACK LINK ────────────────────────────────── */}
 <Link
 to={`/policies?category=${policy.category}`}
 className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 "
 >
 <ArrowLeft className="h-4 w-4" />
 Back to {toTitleCase(policy.category)} Insurance
 </Link>

 {/* ─── HERO HEADER ──────────────────────────────── */}
 <div
 className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r ${cat.gradient} p-5 text-white shadow-xl sm:p-8 lg:p-10`}
 >
 {/* decorative circles */}
 <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
 <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

 <div className="relative z-10">
 {/* category badge */}
 <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
 <CatIcon className="h-3.5 w-3.5" />
 {toTitleCase(policy.category)} Insurance
 </span>

 <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
 {policy.name}
 </h1>
 <p className="mt-1 text-lg text-white/80">{policy.company}</p>
 <p className="mt-3 max-w-2xl leading-relaxed text-white/90">
 {policy.description}
 </p>

 {/* stat cards */}
 <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
 <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
 <p className="text-xs text-white/70">Annual Premium</p>
 <p className="text-xl font-bold">{formatCurrency(policy.price)}</p>
 </div>
 <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
 <p className="text-xs text-white/70">Sum Insured</p>
 <p className="text-xl font-bold">{formatCurrency(policy.coverage)}</p>
 </div>
 <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
 <p className="text-xs text-white/70">Rating</p>
 <p className="flex items-center gap-1 text-xl font-bold">
 <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
 {reviewSummary}
 </p>
 </div>
 <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
 <p className="text-xs text-white/70">Reviews</p>
 <p className="text-xl font-bold">{policy.reviewsCount || 0}</p>
 </div>
 </div>

 {/* CTA */}
 <button
 type="button"
 onClick={handlePurchase}
 className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-slate-100"
 >
 <ShoppingCart className="h-4 w-4" />
 Buy Now — {formatCurrency(policy.price)}/yr
 </button>
 </div>
 </div>

 {/* ─── KEY BENEFITS ─────────────────────────────── */}
 <Section icon={CheckCircle2} title="Key Benefits" defaultOpen={true}>
 <div className="grid gap-3 sm:grid-cols-2">
 {policy.benefits?.map((benefit, i) => (
 <div
 key={i}
 className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 "
 >
 <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
 <span className="text-sm text-slate-700 ">{benefit}</span>
 </div>
 ))}
 </div>
 </Section>

 {/* ─── COVERAGE DETAILS ─────────────────────────── */}
 {policy.coverageDetails?.length > 0 && (
 <Section icon={FileText} title="Coverage Details" defaultOpen={true}>
 <div className="overflow-x-auto -mx-4 sm:-mx-6">
 <div className="inline-block min-w-full px-4 sm:px-6">
 <div className="overflow-hidden rounded-xl border border-slate-200 ">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-slate-50 ">
 <th className="px-4 py-3 text-left font-semibold text-slate-700 ">Coverage Type</th>
 <th className="px-4 py-3 text-left font-semibold text-slate-700 ">Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 ">
 {policy.coverageDetails.map((item, i) => (
 <tr key={i} className="transition hover:bg-slate-50 ">
 <td className="px-4 py-3 font-medium text-slate-900 ">{item.label}</td>
 <td className="px-4 py-3 text-slate-600 ">{item.value}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </Section>
 )}

 {/* ─── PREMIUM INFORMATION ──────────────────────── */}
 {(policy.premiumInfo || policy.financialTerms || policy.policyTermYears) && (
 <Section icon={IndianRupee} title="Pricing & Terms" defaultOpen={true}>
 <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
 {policy.premiumInfo && Object.entries(policy.premiumInfo).map(([key, value]) => {
 const labelMap = {
 basePremium: "Base Premium",
 gst: "GST",
 discounts: "Available Discounts",
 paymentOptions: "Payment Options",
 };
 return (
 <div key={key} className="rounded-xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{labelMap[key] || key}</p>
 <p className="mt-1 text-sm font-medium text-slate-800 ">{value}</p>
 </div>
 );
 })}
 
 {/* New Financial Terms Fields */}
 {policy.financialTerms && (
 <>
 <div className="rounded-xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deductible</p>
 <p className="mt-1 text-sm font-medium text-slate-800 ">{formatCurrency(policy.financialTerms.deductible || 0)}</p>
 </div>
 <div className="rounded-xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Co-pay</p>
 <p className="mt-1 text-sm font-medium text-slate-800 ">{policy.financialTerms.copayPercentage || 0}%</p>
 </div>
 </>
 )}

 {/* General Policy Terms */}
 {policy.policyTermYears && (
 <div className="rounded-xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Policy Term</p>
 <p className="mt-1 text-sm font-medium text-slate-800 ">{policy.policyTermYears} Year(s)</p>
 </div>
 )}
 {policy.gracePeriodDays && (
 <div className="rounded-xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Grace Period</p>
 <p className="mt-1 text-sm font-medium text-slate-800 ">{policy.gracePeriodDays} Days</p>
 </div>
 )}
 {policy.taxBenefitSection && policy.taxBenefitSection !== "None" && (
 <div className="rounded-xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tax Benefit</p>
 <p className="mt-1 text-sm font-medium text-slate-800 ">Sec {policy.taxBenefitSection}</p>
 </div>
 )}
 </div>

 {policy.availableRiders?.length > 0 && (
 <div className="mt-6 border-t border-slate-100 pt-5 ">
 <h3 className="mb-3 text-sm font-bold text-slate-900 ">Optional Add-ons (Riders)</h3>
 <div className="flex flex-wrap gap-3">
 {policy.availableRiders.map((rider, i) => (
 <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ">
 <Shield className="h-3 w-3" />
 {rider.name} • +{formatCurrency(rider.price)}
 </span>
 ))}
 </div>
 </div>
 )}
 </Section>
 )}

 {/* ─── ELIGIBILITY ──────────────────────────────── */}
 {policy.eligibility?.length > 0 && (
 <Section icon={UserCheck} title="Eligibility Criteria" defaultOpen={false}>
 <ul className="space-y-3">
 {policy.eligibility.map((item, i) => (
 <li key={i} className="flex items-start gap-3 text-sm text-slate-700 ">
 <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 ">
 {i + 1}
 </span>
 {item}
 </li>
 ))}
 </ul>
 </Section>
 )}

 {/* ─── TERMS & CONDITIONS ───────────────────────── */}
 {policy.termsAndConditions?.length > 0 && (
 <Section icon={Scale} title="Terms & Conditions" defaultOpen={false}>
 <ul className="space-y-3">
 {policy.termsAndConditions.map((item, i) => (
 <li key={i} className="flex items-start gap-3 text-sm text-slate-700 ">
 <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
 {item}
 </li>
 ))}
 </ul>
 </Section>
 )}

 {/* ─── CLAIM PROCESS ────────────────────────────── */}
 {policy.claimProcess?.length > 0 && (
 <Section icon={ClipboardList} title="Claim Process" defaultOpen={false}>
 <div className="relative space-y-0">
 {policy.claimProcess.map((step, i) => (
 <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
 {/* vertical line */}
 {i < policy.claimProcess.length - 1 && (
 <div className="absolute left-[15px] top-8 h-full w-0.5 bg-indigo-100 " />
 )}
 {/* step number */}
 <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-md">
 {i + 1}
 </div>
 <p className="pt-1 text-sm text-slate-700 ">{step}</p>
 </div>
 ))}
 </div>
 </Section>
 )}

 {/* ─── REVIEWS ──────────────────────────────────── */}
 <div className="grid gap-6 lg:grid-cols-2">
 <Section icon={Star} title={`Reviews (${reviews.length})`} defaultOpen={true}>
 <div className="space-y-3">
 {reviews.map((review) => (
<div
 key={review._id || review.id}
className="rounded-xl bg-slate-50 p-4 "
>
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 ">
 {(review.user || "U")[0].toUpperCase()}
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900 ">{review.user}</p>
 <div className="flex items-center gap-1">
 {[...Array(5)].map((_, idx) => (
 <Star
 key={idx}
 className={`h-3 w-3 ${idx < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 "}`}
 />
 ))}
 </div>
 </div>
 </div>
 <p className="mt-2 text-sm text-slate-600 ">{review.comment}</p>
 </div>
 ))}
 {!reviews.length && (
 <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
 )}
 </div>
 </Section>

 {/* ─── ADD REVIEW ─────────────────────────────── */}
 <section
 className="rounded-2xl border border-slate-200 bg-white shadow-sm "
 >
 <div className="flex items-center gap-3 px-6 py-4">
 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ">
 <FileText className="h-4.5 w-4.5" />
 </div>
 <h2 className="text-lg font-semibold text-slate-900 ">Write a Review</h2>
 </div>
 <form onSubmit={handleReview} className="border-t border-slate-100 px-6 py-5 ">
 <label className="block text-sm font-medium text-slate-700 ">
 Your Rating
 </label>
 <div className="mt-2 flex gap-1">
 {[1, 2, 3, 4, 5].map((val) => (
 <button
 key={val}
 type="button"
 onClick={() => setReviewInput((p) => ({ ...p, rating: val }))}
 className="transition hover:scale-110"
 >
 <Star
 className={`h-7 w-7 ${val <= reviewInput.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 "}`}
 />
 </button>
 ))}
 </div>

 <label className="mt-4 block text-sm font-medium text-slate-700 ">
 Your Review
 </label>
 <textarea
 value={reviewInput.comment}
 onChange={(e) => setReviewInput((p) => ({ ...p, comment: e.target.value }))}
 className="field mt-2 h-28 resize-none"
 placeholder="Share your experience with this policy..."
 />

 <button
 className="btn-primary mt-4 w-full"
 >
 Submit Review
 </button>
 </form>
 </section>
 </div>

 {/* ─── STICKY BOTTOM CTA (mobile) ───────────────── */}
 <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-lg safe-bottom sm:hidden ">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-xs text-slate-500">Annual Premium</p>
 <p className="text-lg font-bold text-slate-900 ">{formatCurrency(policy.price)}</p>
 </div>
 <button
 type="button"
 onClick={handlePurchase}
 className="btn-primary"
 >
 <ShoppingCart className="h-4 w-4" />
 Buy Now
 </button>
 </div>
 </div>
 </div>
 );
}
