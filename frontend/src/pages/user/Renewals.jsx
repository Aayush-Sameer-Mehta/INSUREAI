import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, Car, CheckCircle2, CreditCard, FileSearch, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import InsuranceTypeStep from "../../components/renewals/InsuranceTypeStep";
import RenewalLookupStep from "../../components/renewals/RenewalLookupStep";
import RenewalPolicyCard from "../../components/renewals/RenewalPolicyCard";
import AISuggestions from "../../components/renewals/AISuggestions";
import RenewalActionPanel from "../../components/renewals/RenewalActionPanel";
import { Badge, Card, EmptyState, PageHeader, ProgressStepper } from "../../components/common";
import {
 cleanLookupInput,
 detectLookupKind,
 fetchRenewalPolicyDetails,
 fetchRenewalPolicyDetailsForUser,
 formatLookupDisplay,
 INSURANCE_TYPES,
 payRenewal,
} from "../../services/renewalService";

const STEP_CONFIG = [
 { key: "type", label: "Insurance Type", icon: ShieldCheck },
 { key: "lookup", label: "Find Policy", icon: FileSearch },
 { key: "details", label: "Policy Details", icon: CheckCircle2 },
 { key: "payment", label: "Renew & Pay", icon: CreditCard },
];

const PAGE_ANIMATION = {
 initial: { opacity: 0, y: 14 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -10 },
 transition: { duration: 0.24 },
};

function getStepIndex(stepKey) {
 return STEP_CONFIG.findIndex((step) => step.key === stepKey);
}

function getLookupError(value, insuranceType) {
 if (!insuranceType) return "Select an insurance type first.";
 if (!cleanLookupInput(value)) return "Enter your policy number or vehicle number.";
 if (cleanLookupInput(value).length < 6) return "Please enter at least 6 characters.";
 return "";
}

export default function Renewals() {
 const navigate = useNavigate();
 const [currentStep, setCurrentStep] = useState("type");
 const [insuranceType, setInsuranceType] = useState("car");
 const [lookupValue, setLookupValue] = useState("");
 const [policyResult, setPolicyResult] = useState(null);
 const [lookupLoading, setLookupLoading] = useState(false);
 const [lookupError, setLookupError] = useState("");
 const [paymentLoading, setPaymentLoading] = useState(false);
 const [paymentError, setPaymentError] = useState("");
 const [paymentSuccess, setPaymentSuccess] = useState("");
 const [autoFetchAttempted, setAutoFetchAttempted] = useState(false);

 const detectedKind = useMemo(() => detectLookupKind(lookupValue), [lookupValue]);
 const insuranceTypeLabel = INSURANCE_TYPES.find((option) => option.key === insuranceType)?.label || "Insurance";

 const helperMessage =
 detectedKind === "vehicle"
 ? `Detected vehicle number: ${formatLookupDisplay(lookupValue)}`
 : detectedKind === "policy"
 ? "Detected policy number format."
 : "Supports policy numbers for all insurance types and vehicle numbers for car/bike renewals.";

 const canOpenStep = (stepKey) => {
 const targetIndex = getStepIndex(stepKey);
 const currentIndex = getStepIndex(currentStep);
 if (targetIndex <= currentIndex) return true;
 if (stepKey === "lookup") return Boolean(insuranceType);
 if (stepKey === "details") return Boolean(policyResult?.policy);
 if (stepKey === "payment") return Boolean(policyResult?.policy);
 return false;
 };

 const autoLoadPolicyForType = useCallback(
 async (selectedType, { silent = true, preserveStep = false } = {}) => {
 setLookupLoading(true);
 setLookupError("");
 setPaymentError("");
 setPaymentSuccess("");

 try {
 const result = await fetchRenewalPolicyDetailsForUser({
 insuranceType: selectedType,
 });

 setPolicyResult(result);
 setLookupValue(result?.policy?.policyNumber || result?.policy?.vehicleNumber || "");
 if (!preserveStep) setCurrentStep("details");
 if (!silent) toast.success("Policy details auto-loaded from your account.");
 return true;
 } catch {
 // Keep manual lookup available without noisy errors.
 setPolicyResult(null);
 if (!preserveStep) setCurrentStep("lookup");
 if (!silent) {
 toast.error("No matching policy found for this insurance type. Please search manually.");
 }
 return false;
 } finally {
 setLookupLoading(false);
 }
 },
 [],
 );

 const handleSelectType = (value) => {
 setInsuranceType(value);
 setCurrentStep("lookup");
 setLookupError("");
 setAutoFetchAttempted(true);
 autoLoadPolicyForType(value, { silent: false });
 };

 useEffect(() => {
 if (autoFetchAttempted) return;
 setAutoFetchAttempted(true);
 autoLoadPolicyForType(insuranceType, { silent: true, preserveStep: false });
 }, [autoFetchAttempted, autoLoadPolicyForType, insuranceType]);

 const handleLookupSubmit = async (event) => {
 event.preventDefault();
 const validationError = getLookupError(lookupValue, insuranceType);

 if (validationError) {
 setLookupError(validationError);
 return;
 }

 setLookupLoading(true);
 setLookupError("");
 setPaymentError("");
 setPaymentSuccess("");

 try {
 const result = await fetchRenewalPolicyDetails({
 lookupValue,
 insuranceType,
 });

 setPolicyResult(result);
 setCurrentStep("details");

 if (result.source === "fallback") {
 toast.success("Policy details loaded from your account data.");
 } else {
 toast.success("Policy details fetched successfully.");
 }
 } catch (error) {
 const message = error?.message || "We couldn't find renewal details for this request.";
 setLookupError(message);
 setPolicyResult(null);
 toast.error(message);
 } finally {
 setLookupLoading(false);
 }
 };

 const handleRenewNow = () => {
 setCurrentStep("payment");
 setPaymentError("");
 setPaymentSuccess("");
 };

 const handleComparePlans = () => {
 if (policyResult?.renewalOffers?.length) {
 setCurrentStep("details");
 toast.success("Showing renewal alternatives and AI insights.");
 return;
 }

 navigate(`/policies?category=${insuranceType}`);
 };

 const handleDownloadPolicy = async () => {
 const downloadUrl = policyResult?.policy?.policyDocumentPath;
 if (!downloadUrl) {
 toast.error("Policy document is not available for download.");
 return;
 }

 window.open(downloadUrl, "_blank", "noopener,noreferrer");
 };

 const handlePayRenewal = async () => {
 if (!policyResult?.policy) return;

 setPaymentLoading(true);
 setPaymentError("");
 setPaymentSuccess("");

 try {
 const resolvedPolicyId = policyResult.policy.policyId || policyResult.policy.id;
 const resolvedPurchaseId = policyResult.policy.purchaseId || null;

 const response = await payRenewal({
 purchaseId: resolvedPurchaseId,
 policyId: resolvedPolicyId,
 policyNumber: policyResult.policy.policyNumber,
 insuranceType: policyResult.policy.insuranceType,
 amount: policyResult.renewalOffers?.[0]?.premiumAmount || policyResult.policy.premiumAmount,
 });

 const message = response?.message || "Renewal payment initiated successfully.";
 setPaymentSuccess(message);
 toast.success(message);
 } catch (error) {
 const message = error?.response?.data?.message || error?.message || "Renewal payment failed. Please try again.";
 setPaymentError(message);
 toast.error(message);
 } finally {
 setPaymentLoading(false);
 }
 };

 const heroStats = [
 { label: "Supported renewals", value: "Car, Bike, Health, Life" },
 { label: "Lookup modes", value: "Policy number + vehicle number" },
 { label: "Action ready", value: "Compare, renew, download" },
 ];

 return (
 <div className="space-y-8 page-shell">
 <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-6 shadow-sm sm:p-8">
 <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-200/40 blur-3xl " />
 <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-300/30 blur-3xl " />
 <div className="relative space-y-6">
 <PageHeader
 title="Policy Renewal"
 subtitle="A modern renewal journey with step-based search, policy preview, AI guidance, and payment readiness."
 icon={Car}
 className="mb-0"
 />

 <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
 <div className="max-w-3xl rounded-[28px] border border-white/70 bg-white/80 p-5 backdrop-blur ">
 <p className="text-sm leading-7 text-slate-600 ">
 Inspired by real insurance renewal journeys, this flow keeps users focused: choose the insurance type, search by policy or vehicle number, review policy details, then renew with confidence.
 </p>
 </div>
 <div className="grid gap-3 sm:grid-cols-3">
 {heroStats.map((stat) => (
 <div key={stat.label} className="rounded-[24px] border border-slate-200 bg-white/85 px-4 py-4 text-center shadow-sm ">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
 <p className="mt-2 text-sm font-semibold text-slate-900 ">{stat.value}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 <Card
 header={
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <h2 className="text-lg font-black tracking-tight text-slate-900 ">Renewal Flow</h2>
 <p className="mt-1 text-sm text-slate-500">A guided four-step experience for production-ready renewals.</p>
 </div>
 <ProgressStepper steps={STEP_CONFIG} currentStep={currentStep} />
 </div>
 }
 >
 <div className="mt-1 grid gap-3 md:grid-cols-4">
 {STEP_CONFIG.map((step) => {
 const active = currentStep === step.key;
 const enabled = canOpenStep(step.key);

 return (
 <button
 key={step.key}
 type="button"
 disabled={!enabled}
 onClick={() => enabled && setCurrentStep(step.key)}
 className={`rounded-2xl border px-4 py-3 text-left transition ${
 active
 ? "border-primary-500 bg-primary-50 "
 : enabled
 ? "border-slate-200 bg-white hover:border-slate-300 "
 : "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 "
 }`}
 >
 <div className="flex items-center justify-between gap-2">
 <span className="text-sm font-semibold text-slate-900 ">{step.label}</span>
 {active && <Badge color="info">Current</Badge>}
 </div>
 </button>
 );
 })}
 </div>
 </Card>

 <AnimatePresence mode="wait">
 {currentStep === "type" && (
 <motion.section key="type" {...PAGE_ANIMATION} className="space-y-4">
 <div>
 <h2 className="text-xl font-black tracking-tight text-slate-900 ">Step 1: Select insurance type</h2>
 <p className="text-sm text-slate-500 ">Choose the product you want to renew so we can tailor the lookup flow.</p>
 </div>
 <InsuranceTypeStep options={INSURANCE_TYPES} value={insuranceType} onChange={handleSelectType} />
 </motion.section>
 )}

 {currentStep === "lookup" && (
 <motion.section key="lookup" {...PAGE_ANIMATION} className="space-y-4">
 <div className="flex items-center justify-between gap-3">
 <div>
 <h2 className="text-xl font-black tracking-tight text-slate-900 ">Step 2: Enter policy or vehicle number</h2>
 <p className="text-sm text-slate-500 ">We detect the lookup type automatically whenever possible.</p>
 </div>
 <Badge color="purple">{insuranceTypeLabel}</Badge>
 </div>
 <RenewalLookupStep
 insuranceTypeLabel={insuranceTypeLabel}
 lookupValue={lookupValue}
 onLookupValueChange={(value) => {
 setLookupValue(value);
 if (lookupError) setLookupError("");
 }}
 detectedKind={detectedKind}
 validationError={lookupError}
 helperMessage={helperMessage}
 onSubmit={handleLookupSubmit}
 loading={lookupLoading}
 />
 </motion.section>
 )}

 {currentStep === "details" && (
 <motion.section key="details" {...PAGE_ANIMATION} className="space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h2 className="text-xl font-black tracking-tight text-slate-900 ">Step 3: Review policy details</h2>
 <p className="text-sm text-slate-500 ">Confirm the policy, status, premium, and renewal options before you proceed.</p>
 </div>
 <button
 type="button"
 onClick={() => setCurrentStep("lookup")}
 className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 "
 >
 Search again
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>

 {lookupLoading ? (
 <Loader label="Fetching policy details..." />
 ) : policyResult?.policy ? (
 <>
 <RenewalPolicyCard
 policy={policyResult.policy}
 onRenewNow={handleRenewNow}
 onComparePlans={handleComparePlans}
 onDownloadPolicy={handleDownloadPolicy}
 />
 <AISuggestions
 insights={policyResult.aiInsights}
 offers={policyResult.renewalOffers}
 onComparePlans={handleComparePlans}
 />
 </>
 ) : (
 <EmptyState
 icon={FileSearch}
 title="No policy loaded yet"
 description="Use the search step to fetch policy details before continuing to renewal."
 actionLabel="Go to Search"
 onAction={() => setCurrentStep("lookup")}
 />
 )}
 </motion.section>
 )}

 {currentStep === "payment" && (
 <motion.section key="payment" {...PAGE_ANIMATION} className="space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h2 className="text-xl font-black tracking-tight text-slate-900 ">Step 4: Renewal and payment</h2>
 <p className="text-sm text-slate-500 ">Finalize the renewal with clear feedback for loading, success, and failure states.</p>
 </div>
 <button
 type="button"
 onClick={() => setCurrentStep("details")}
 className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 "
 >
 Back to details
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>

 {policyResult?.policy ? (
 <RenewalActionPanel
 policy={policyResult.policy}
 renewalOffers={policyResult.renewalOffers}
 processing={paymentLoading}
 error={paymentError}
 successMessage={paymentSuccess}
 onPayRenewal={handlePayRenewal}
 />
 ) : (
 <EmptyState
 icon={CreditCard}
 title="Policy details required"
 description="Load a policy first so we can prepare the renewal payment request."
 actionLabel="Find Policy"
 onAction={() => setCurrentStep("lookup")}
 />
 )}
 </motion.section>
 )}
 </AnimatePresence>
 </div>
 );
}
