import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
 ArrowLeft,
 ShieldCheck,
 CreditCard,
 Wallet,
 Landmark,
 Smartphone,
 IndianRupee,
 CheckCircle2,
 Lock,
 Star,
 Clock,
 Sparkles,
 ArrowRight,
 Loader2,
 Car,
 Bike,
 HeartPulse,
 Shield,
 Plane,
 Home as HomeIcon,
} from "lucide-react";
import Loader from "../../components/Loader";
import api from "../../services/api";
import { fetchPolicyById } from "../../services/policyService";
import { confirmPayment, createPaymentOrder, verifyPayment } from "../../services/paymentService";
import { formatCurrency, toTitleCase } from "../../utils/formatters";

/* ─── category maps ──────────────────────────────────── */
const CAT_ICONS = { car: Car, bike: Bike, health: HeartPulse, life: Shield, travel: Plane, home: HomeIcon };
const CAT_GRADIENTS = {
 car: "from-blue-500 to-blue-700",
 bike: "from-emerald-500 to-emerald-700",
 health: "from-rose-500 to-rose-700",
 life: "from-violet-500 to-violet-700",
 travel: "from-amber-500 to-amber-700",
 home: "from-cyan-500 to-cyan-700",
};

/* ─── payment method options ─────────────────────────── */
const PAYMENT_METHODS = [
 { id: "upi", label: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: Smartphone, color: "from-violet-500 to-purple-600" },
 { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Rupay", icon: CreditCard, color: "from-blue-500 to-indigo-600" },
 { id: "netbanking", label: "Net Banking", desc: "All major banks", icon: Landmark, color: "from-emerald-500 to-teal-600" },
 { id: "wallet", label: "Wallet", desc: "Amazon Pay, Mobikwik", icon: Wallet, color: "from-amber-500 to-orange-600" },
];

export default function Payment() {
 const { policyId } = useParams();
 const navigate = useNavigate();

 const [policy, setPolicy] = useState(null);
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [selectedMethod, setSelectedMethod] = useState("upi");
 const [processing, setProcessing] = useState(false);
 const [success, setSuccess] = useState(false);

 /* ── KYC state ── */
 const [kycPan, setKycPan] = useState("");
 const [kycAadhaar, setKycAadhaar] = useState("");
 const [kycLoading, setKycLoading] = useState(false);

 /* ── UPI state ── */
 const [upiId, setUpiId] = useState("");
 /* ── Card state ── */
 const [cardNumber, setCardNumber] = useState("");
 const [cardExpiry, setCardExpiry] = useState("");
 const [cardCvv, setCardCvv] = useState("");
 const [cardName, setCardName] = useState("");
 /* ── Net Banking ── */
 const [selectedBank, setSelectedBank] = useState("");

 useEffect(() => {
 (async () => {
 setLoading(true);
 try {
 const [data, profileRes] = await Promise.all([
 fetchPolicyById(policyId),
 api.get("/users/profile").catch(() => null),
 ]);
 if (!data) {
 toast.error("Policy not found");
 navigate("/policies", { replace: true });
 return;
 }
 setPolicy(data);
 if (profileRes?.data) setProfile(profileRes.data);
 } catch {
 toast.error("Failed to load policy");
 navigate("/policies", { replace: true });
 } finally {
 setLoading(false);
 }
 })();
 }, [policyId, navigate]);

 /* ── KYC handler ── */
 const handleKycSubmit = async (e) => {
 e.preventDefault();
 setKycLoading(true);
 try {
 const { data } = await api.put("/users/kyc", {
 panCardNumber: kycPan,
 aadhaarNumber: kycAadhaar,
 });
 if (data.verified) {
 toast.success("KYC Verified Successfully!");
 setProfile((prev) => ({ ...prev, kycDetails: data.kycDetails }));
 } else {
 toast.error("Verification failed. Check your PAN/Aadhaar.");
 }
 } catch (error) {
 toast.error(error.response?.data?.message || "Failed to verify KYC");
 } finally {
 setKycLoading(false);
 }
 };

 /* ── validate before paying ── */
 const isFormValid = () => {
 if (selectedMethod === "upi") return upiId.includes("@");
 if (selectedMethod === "card") return cardNumber.replace(/\s/g, "").length === 16 && cardExpiry.length === 5 && cardCvv.length === 3 && cardName.trim().length > 0;
 if (selectedMethod === "netbanking") return selectedBank.length > 0;
 return true; // wallet
 };

 /* ── handle purchase ── */
 const handlePay = async () => {
 if (!isFormValid()) {
 toast.error("Please fill in all payment details");
 return;
 }
 setProcessing(true);
 try {
 const order = await createPaymentOrder(policyId, policy.price);
 await verifyPayment({
 policyId,
 orderId: order?.order?.id || `order_${Date.now()}`,
 paymentId: `pay_${Date.now()}`,
 signature: "mock_signature",
 paymentMethod: selectedMethod,
 });
 setSuccess(true);
 toast.success("Policy purchased successfully!");
 setTimeout(() => navigate("/dashboard"), 3000);
 } catch {
 // Fallback to legacy endpoint for backward compatibility.
 try {
 await confirmPayment(policyId, selectedMethod);
 setSuccess(true);
 toast.success("Policy purchased successfully!");
 setTimeout(() => navigate("/dashboard"), 3000);
 } catch (legacyErr) {
 toast.error(legacyErr?.response?.data?.message || "Payment failed. Please try again.");
 }
 } finally {
 setProcessing(false);
 }
 };

 if (loading) return <Loader label="Loading checkout..." />;
 if (!policy) return null;

 const CatIcon = CAT_ICONS[policy.category] || Shield;
 const gradient = CAT_GRADIENTS[policy.category] || "from-slate-500 to-slate-700";
 const isKycVerified = profile?.kycDetails?.isKycVerified;

 /* ─── SUCCESS STATE ────────────────────────────────── */
 if (success) {
 return (
 <div className="flex min-h-[60vh] items-center justify-center">
 <div className="mx-auto max-w-md text-center">
 <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-2xl shadow-emerald-500/30">
 <CheckCircle2 className="h-12 w-12 text-white" />
 </div>
 <h1 className="text-3xl font-extrabold text-slate-900 ">
 Payment Successful!
 </h1>
 <p className="mt-3 text-slate-500 ">
 Your <span className="font-semibold text-slate-700 ">{policy.name}</span> policy is now active.
 </p>
 <p className="mt-1 text-sm text-slate-400 ">
 Redirecting to dashboard...
 </p>
 <div className="mt-6">
 <Link
 to="/dashboard"
 className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25"
 >
 Go to Dashboard
 <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </div>
 );
 }

 /* ─── CHECKOUT PAGE ────────────────────────────────── */
 return (
 <div className="space-y-6 pb-10">
 {/* Decorative bg */}
 <div className="pointer-events-none fixed inset-0 overflow-hidden">
 <div className="absolute -right-40 -top-40 h-[20rem] w-[20rem] sm:h-[30rem] sm:w-[30rem] rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl" />
 <div className="absolute -bottom-40 -left-40 h-[20rem] w-[20rem] sm:h-[30rem] sm:w-[30rem] rounded-full bg-gradient-to-br from-emerald-400/8 to-cyan-400/8 blur-3xl" />
 </div>

 {/* Back link */}
 <div>
 <Link
 to={`/policies/${policyId}`}
 className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 "
 >
 <ArrowLeft className="h-4 w-4" />
 Back to Policy Details
 </Link>
 </div>

 {/* Page title */}
 <div>
 <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
 <Lock className="mr-2 inline-block h-6 w-6 text-emerald-500" />
 Secure Checkout
 </h1>
 <p className="mt-1 text-sm text-slate-500 ">
 Complete your purchase to activate your insurance policy
 </p>
 </div>

 <div className="grid gap-6 lg:grid-cols-5">
 {/* ═══ LEFT: KYC Gate / Payment Methods ═══ */}
 <div className="order-2 space-y-5 lg:order-1 lg:col-span-3">

 {/* ── KYC Verification Gate ── */}
 {!isKycVerified ? (
 <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-sm ">
 <div className="flex items-center gap-3 mb-4">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
 <ShieldCheck className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-amber-900 ">KYC Verification Required</h2>
 <p className="text-xs text-amber-700 ">One-time identity verification as per IRDAI guidelines</p>
 </div>
 </div>
 <div className="mb-5 rounded-xl bg-amber-100/50 p-3 ">
 <p className="text-sm text-amber-800 ">
 Please provide your PAN card number and Aadhaar number to complete e-KYC verification before purchasing this policy.
 </p>
 </div>
 <form onSubmit={handleKycSubmit} className="space-y-4">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-amber-900 ">PAN Card Number</label>
 <input
 type="text"
 maxLength={10}
 value={kycPan}
 onChange={(e) => setKycPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
 placeholder="ABCDE1234F"
 className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-mono tracking-wider outline-none transition focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 "
 required
 />
 <p className="mt-1 text-xs text-amber-600 ">10-character alphanumeric PAN</p>
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-amber-900 ">Aadhaar Number</label>
 <input
 type="text"
 maxLength={12}
 value={kycAadhaar}
 onChange={(e) => setKycAadhaar(e.target.value.replace(/\D/g, ""))}
 placeholder="123456789012"
 className="w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-3 text-sm font-mono tracking-wider outline-none transition focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/10 "
 required
 />
 <p className="mt-1 text-xs text-amber-600 ">12-digit Aadhaar number</p>
 </div>
 <button
 type="submit"
 disabled={kycLoading || kycPan.length !== 10 || kycAadhaar.length !== 12}
 className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
 >
 {kycLoading && <Loader2 className="h-4 w-4 animate-spin" />}
 {kycLoading ? "Verifying..." : "Verify & Continue to Payment"}
 </button>
 </form>
 <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-amber-600 ">
 <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted</span>
 <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> IRDAI Compliant</span>
 </div>
 </div>
 ) : (
 <>
 {/* ── KYC Verified Badge ── */}
 <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 ">
 <CheckCircle2 className="h-5 w-5 text-emerald-500" />
 <div>
 <p className="text-sm font-semibold text-emerald-800 ">KYC Verified</p>
 <p className="text-xs text-emerald-600 ">PAN: {profile?.kycDetails?.panCardNumber?.replace(/(.{5})/, "$1•••")}</p>
 </div>
 </div>

 {/* Payment Method Selection */}
 <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm ">
 <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 ">
 <CreditCard className="h-5 w-5 text-indigo-500" />
 Payment Method
 </h2>

 <div className="mt-4 grid gap-3 sm:grid-cols-2">
 {PAYMENT_METHODS.map((method) => {
 const Icon = method.icon;
 const isActive = selectedMethod === method.id;
 return (
 <button
 key={method.id}
 type="button"
 onClick={() => setSelectedMethod(method.id)}
 className={`relative flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${isActive
 ? "border-indigo-500 bg-indigo-50/80 shadow-md shadow-indigo-500/10 "
 : "border-slate-200 hover:border-slate-300 "
 }`}
 >
 <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${method.color} text-white shadow-sm`}>
 <Icon className="h-5 w-5" />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900 ">{method.label}</p>
 <p className="text-xs text-slate-500 ">{method.desc}</p>
 </div>
 {isActive && (
 <div className="absolute right-3 top-3">
 <CheckCircle2 className="h-5 w-5 text-indigo-500 " />
 </div>
 )}
 </button>
 );
 })}
 </div>
 </div>

 {/* Payment Details Form */}
 <div
 key={selectedMethod}
 className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm "
 >
 <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500 ">
 {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label} Details
 </h3>

 {/* UPI Form */}
 {selectedMethod === "upi" && (
 <div className="space-y-4">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">UPI ID</label>
 <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 transition focus-within:border-indigo-500 focus-within:shadow-lg focus-within:shadow-indigo-500/10 ">
 <Smartphone className="h-4 w-4 text-slate-400" />
 <input
 type="text"
 placeholder="yourname@upi"
 value={upiId}
 onChange={(e) => setUpiId(e.target.value)}
 className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 "
 />
 </div>
 <p className="mt-1.5 text-xs text-slate-400">e.g. name@paytm, name@ybl, 9999999999@upi</p>
 </div>
 </div>
 )}

 {/* Card Form */}
 {selectedMethod === "card" && (
 <div className="space-y-4">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Card Number</label>
 <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 transition focus-within:border-indigo-500 focus-within:shadow-lg focus-within:shadow-indigo-500/10 ">
 <CreditCard className="h-4 w-4 text-slate-400" />
 <input
 type="text"
 placeholder="1234 5678 9012 3456"
 maxLength={19}
 value={cardNumber}
 onChange={(e) => {
 const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
 setCardNumber(raw.replace(/(\d{4})(?=\d)/g, "$1 "));
 }}
 className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 "
 />
 </div>
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Cardholder Name</label>
 <input
 type="text"
 placeholder="Name on card"
 value={cardName}
 onChange={(e) => setCardName(e.target.value)}
 className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 placeholder:text-slate-400"
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Expiry</label>
 <input
 type="text"
 placeholder="MM/YY"
 maxLength={5}
 value={cardExpiry}
 onChange={(e) => {
 let val = e.target.value.replace(/\D/g, "").slice(0, 4);
 if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
 setCardExpiry(val);
 }}
 className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 placeholder:text-slate-400"
 />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">CVV</label>
 <input
 type="password"
 placeholder="•••"
 maxLength={3}
 value={cardCvv}
 onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
 className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/10 placeholder:text-slate-400"
 />
 </div>
 </div>
 </div>
 )}

 {/* Net Banking */}
 {selectedMethod === "netbanking" && (
 <div className="space-y-4">
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Select Your Bank</label>
 <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
 {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"].map((bank) => (
 <button
 key={bank}
 type="button"
 onClick={() => setSelectedBank(bank)}
 className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${selectedBank === bank
 ? "border-indigo-500 bg-indigo-50 text-indigo-700 "
 : "border-slate-200 text-slate-600 hover:border-slate-300 "
 }`}
 >
 {bank}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Wallet */}
 {selectedMethod === "wallet" && (
 <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 ">
 <Wallet className="h-5 w-5 text-amber-600 " />
 <p className="text-sm text-amber-800 ">
 You'll be redirected to complete payment via your selected wallet after clicking Pay Now.
 </p>
 </div>
 )}
 </div>

 {/* Pay Button */}
 <button
 type="button"
 disabled={processing || !isFormValid()}
 onClick={handlePay}
 className={`flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-xl transition-all ${processing || !isFormValid()
 ? "cursor-not-allowed bg-slate-400 shadow-none"
 : "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30"
 }`}
 >
 {processing ? (
 <>
 <Loader2 className="h-5 w-5 animate-spin" />
 Processing Payment...
 </>
 ) : (
 <>
 <Lock className="h-4 w-4" />
 Pay {formatCurrency(policy.price)} & Activate Policy
 </>
 )}
 </button>
 </>
 )}

 {/* Security badges */}
 <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 ">
 <span className="flex items-center gap-1">
 <Lock className="h-3 w-3" /> 256-bit SSL Encryption
 </span>
 <span className="flex items-center gap-1">
 <ShieldCheck className="h-3 w-3" /> IRDAI Compliant
 </span>
 <span className="flex items-center gap-1">
 <CheckCircle2 className="h-3 w-3" /> Instant Policy Activation
 </span>
 </div>
 </div>

 {/* ═══ RIGHT: Order Summary ═══ */}
 <div className="order-1 space-y-5 lg:order-2 lg:col-span-2">
 {/* Policy card */}
 <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm ">
 {/* Policy header */}
 <div className={`flex items-center gap-3 bg-gradient-to-r ${gradient} px-5 py-4 text-white`}>
 <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
 <CatIcon className="h-5 w-5" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="truncate font-semibold">{policy.name}</h3>
 <p className="text-xs text-white/80">{policy.company}</p>
 </div>
 <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
 {toTitleCase(policy.category)}
 </span>
 </div>

 <div className="p-5 space-y-4">
 <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 ">Order Summary</h2>

 {/* Line items */}
 <div className="space-y-3 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-slate-600 ">Annual Premium</span>
 <span className="font-semibold text-slate-900 ">{formatCurrency(policy.price)}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-slate-600 ">Sum Insured (Coverage)</span>
 <span className="font-semibold text-slate-900 ">{formatCurrency(policy.coverage)}</span>
 </div>
 {policy.premiumInfo?.gst && (
 <div className="flex items-center justify-between">
 <span className="text-slate-600 ">GST</span>
 <span className="text-slate-500 ">{policy.premiumInfo.gst}</span>
 </div>
 )}
 <div className="flex items-center justify-between text-xs">
 <span className="flex items-center gap-1 text-slate-500 ">
 <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
 Rating
 </span>
 <span className="text-slate-500 ">{Number(policy.ratingAverage || 0).toFixed(1)} / 5</span>
 </div>
 </div>

 <hr className="border-slate-100 " />

 {/* Total */}
 <div className="flex items-center justify-between">
 <span className="text-base font-bold text-slate-900 ">Total Payable</span>
 <span className="text-xl font-extrabold text-indigo-600 ">
 {formatCurrency(policy.price)}
 </span>
 </div>
 </div>
 </div>

 {/* Benefits quick look */}
 {policy.benefits?.length > 0 && (
 <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm ">
 <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 ">
 <Sparkles className="h-4 w-4 text-amber-500" />
 Key Benefits
 </h3>
 <ul className="space-y-2">
 {policy.benefits.slice(0, 4).map((b, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-slate-600 ">
 <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
 <span>{b}</span>
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Trust indicators */}
 <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm ">
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 ">
 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-900 ">Instant Activation</p>
 <p className="text-[11px] text-slate-500 ">Policy active immediately after payment</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 ">
 <Clock className="h-4 w-4 text-blue-500" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-900 ">30-Day Free Look</p>
 <p className="text-[11px] text-slate-500 ">Full refund within 30 days if not satisfied</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 ">
 <ShieldCheck className="h-4 w-4 text-violet-500" />
 </div>
 <div>
 <p className="text-xs font-semibold text-slate-900 ">100% Secure</p>
 <p className="text-[11px] text-slate-500 ">Your data is protected at every step</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
