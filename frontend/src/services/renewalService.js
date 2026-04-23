import api from "./api";
import { fetchPolicies as fetchPoliciesApi } from "./policyService";
import { createPaymentOrder, openRazorpayCheckout, verifyPayment } from "./paymentService";

export const INSURANCE_TYPES = [
 { key: "car", label: "Car Insurance", shortLabel: "Car" },
 { key: "bike", label: "Bike Insurance", shortLabel: "Bike" },
 { key: "health", label: "Health Insurance", shortLabel: "Health" },
 { key: "life", label: "Life Insurance", shortLabel: "Life" },
];

const VEHICLE_TYPES = new Set(["car", "bike"]);

const STATUS_MAP = {
 active: "Active",
 expiring: "Expiring Soon",
 expired: "Expired",
};

const VEHICLE_REGISTRATION_PATTERN = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;
const POLICY_NUMBER_PATTERN = /^[A-Z0-9-]{6,24}$/;

export function normalizeLookupInput(value) {
 return String(value || "").trim().toUpperCase();
}

export function cleanLookupInput(value) {
 return normalizeLookupInput(value).replace(/\s+/g, "");
}

export function detectLookupKind(value) {
 const normalized = cleanLookupInput(value);
 if (VEHICLE_REGISTRATION_PATTERN.test(normalized)) return "vehicle";
 if (POLICY_NUMBER_PATTERN.test(normalized)) return "policy";
 return "unknown";
}

export function formatLookupDisplay(value) {
 const normalized = cleanLookupInput(value);
 const vehicleMatch = normalized.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{4})$/);

 if (vehicleMatch) {
 return `${vehicleMatch[1]} ${vehicleMatch[2]} ${vehicleMatch[3]} ${vehicleMatch[4]}`;
 }

 return normalized;
}

export function getPolicyStatus(expiryDate) {
 if (!expiryDate) return { label: "Active", tone: "success", daysLeft: null };

 const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
 if (daysLeft < 0) return { label: "Expired", tone: "danger", daysLeft };
 if (daysLeft <= 30) return { label: "Expiring Soon", tone: "warning", daysLeft };
 return { label: "Active", tone: "success", daysLeft };
}

function normalizePolicyPayload(payload, fallbackInsuranceType) {
 const expiryDate = payload.expiryDate || payload.validTo || payload.expiry || payload.endDate || null;
 const status = getPolicyStatus(expiryDate);
 const policyType = payload.policyType || payload.category || payload.policy?.category || fallbackInsuranceType || "car";
 const purchaseId = payload.purchaseId || payload._id || payload.rawPurchaseId || "";
 const resolvedPolicyId =
  payload.policyId ||
  payload.policy?._id ||
  payload.policy?._id?.toString?.() ||
  payload.rawPolicyId ||
  "";

 return {
  id: payload.id || payload._id || payload.purchaseId || payload.policyId || payload.policy?._id || "",
  purchaseId,
  policyId: resolvedPolicyId || payload.id || "",
  policyNumber: payload.policyNumber || payload.policyNo || payload.referenceNumber || payload.purchaseId || "",
  insuranceType: policyType,
  policyName: payload.policyName || payload.name || payload.policy?.name || `${policyType} policy`,
 insurerName: payload.insurerName || payload.company || payload.companyName || payload.policy?.company || "InsureAI Partner",
 premiumAmount: Number(payload.premiumAmount || payload.amount || payload.price || payload.premium || 0),
 expiryDate,
 status: STATUS_MAP[String(payload.status || "").toLowerCase()] || status.label,
 statusTone: status.tone,
 daysLeft: status.daysLeft,
 policyDocumentPath: payload.policyDocumentPath || payload.documentUrl || "",
 coverageAmount: Number(payload.coverageAmount || payload.coverage || payload.sumInsured || 0),
 vehicleNumber: payload.vehicleNumber || payload.registrationNumber || payload.vehicleRegistrationNumber || "",
 raw: payload,
 };
}

function buildAiSuggestions(policy, offers = []) {
 const bestOffer = offers[0];
 const savings = bestOffer ? Math.max(0, Number(policy.premiumAmount || 0) - Number(bestOffer.premiumAmount || 0)) : 0;

 const insights = [
 {
 title: "AI plan check",
 body: bestOffer
 ? `Your current renewal can be compared with ${bestOffer.policyName} from ${bestOffer.insurerName}.`
 : "Your current plan looks reasonable, but the AI module can compare live plans once connected to backend recommendations.",
 tone: "info",
 },
 {
 title: "Potential savings",
 body: savings > 0
 ? `You can save ₹${savings.toLocaleString("en-IN")} by switching plans at renewal.`
 : "No cheaper match is available in the local catalog right now, so continuity may be the better option.",
 tone: savings > 0 ? "success" : "warning",
 },
 {
 title: "Renewal timing",
 body: policy.daysLeft == null
 ? "Renewal timing is available once the expiry date is confirmed."
 : policy.daysLeft < 0
 ? "This policy appears expired, so renewal should be completed immediately to avoid coverage gaps."
 : policy.daysLeft <= 10
 ? "Your policy is close to expiry. Renew now to keep protection uninterrupted."
 : "You still have some time before expiry, which is ideal for comparing plans and benefits.",
 tone: policy.daysLeft != null && policy.daysLeft <= 10 ? "warning" : "info",
 },
 ];

 return {
 summary: savings > 0
 ? `You can save ₹${savings.toLocaleString("en-IN")} by switching plans.`
 : "Your current plan is competitive based on available renewal matches.",
 savings,
 recommendations: insights,
 };
}

function buildOfferFromCatalogEntry(policy, selectedPolicy) {
 return {
 id: policy.id || policy._id,
 policyName: policy.name,
 insurerName: policy.company || policy.companyName || "InsureAI Partner",
 premiumAmount: Number(policy.price || 0),
 coverageAmount: Number(policy.coverage || 0),
 insuranceType: policy.category,
 savingsAmount: Math.max(0, Number(selectedPolicy?.premiumAmount || 0) - Number(policy.price || 0)),
 };
}

async function getFallbackPolicyDetails({ lookupValue, insuranceType }) {
 const normalized = cleanLookupInput(lookupValue);
 const [profileRes, catalog] = await Promise.all([
 api.get("/users/profile"),
 fetchPoliciesApi({ status: "Published", category: insuranceType }),
 ]);

 const purchasedPolicies = profileRes.data?.purchasedPolicies || [];
 const directMatch = purchasedPolicies.find((item) => {
 const purchaseId = cleanLookupInput(item._id);
 const policyId = cleanLookupInput(item.policy?._id);
 const policyNumber = cleanLookupInput(item.policyNumber || item.referenceNumber);
 return [purchaseId, policyId, policyNumber].includes(normalized);
 });

 const matchedPolicy =
 directMatch ||
 purchasedPolicies.find((item) => (insuranceType ? item.policy?.category === insuranceType : true)) ||
 purchasedPolicies[0];

 if (!matchedPolicy) {
 throw new Error("We couldn't find a policy for this renewal request.");
 }

 const normalizedPolicy = normalizePolicyPayload(
 {
 ...matchedPolicy,
 ...matchedPolicy.policy,
 rawPurchaseId: matchedPolicy._id,
 rawPolicyId: matchedPolicy.policy?._id || matchedPolicy.policyId,
 insurerName: matchedPolicy.policy?.company,
 policyName: matchedPolicy.policy?.name,
 premiumAmount: matchedPolicy.amount,
 expiryDate: matchedPolicy.validTo,
 coverageAmount: matchedPolicy.policy?.coverage,
 },
 insuranceType
 );

 const renewalOffers = (catalog || [])
 .filter((policy) => policy.category === normalizedPolicy.insuranceType)
 .map((policy) => buildOfferFromCatalogEntry(policy, normalizedPolicy))
 .sort((a, b) => a.premiumAmount - b.premiumAmount)
 .slice(0, 3);

 return {
 policy: normalizedPolicy,
 renewalOffers,
 aiInsights: buildAiSuggestions(normalizedPolicy, renewalOffers),
 source: "fallback",
 };
}

export async function fetchRenewalPolicyDetails({ lookupValue, insuranceType }) {
 const normalized = cleanLookupInput(lookupValue);
 if (!normalized) {
  throw new Error("Please enter a policy number or vehicle number.");
 }

 return getFallbackPolicyDetails({ lookupValue: normalized, insuranceType });
}

export async function fetchRenewalPolicyDetailsForUser({ insuranceType }) {
 return getFallbackPolicyDetails({ lookupValue: "", insuranceType });
}

export async function payRenewal(payload) {
 const purchaseId = payload?.purchaseId;
 const policyId = payload?.policyId;
 const paymentMethod = payload?.paymentMethod || "upi";
 const amount = payload?.amount;

 if (!purchaseId && !policyId) {
  throw new Error("Purchase ID is required for renewal payment.");
 }

 try {
  let paymentMeta = {};

  if (policyId) {
   const orderResponse = await createPaymentOrder(policyId, amount);
   const gateway = orderResponse?.gateway || {};
   const order = orderResponse?.order || orderResponse;
   const provider = gateway?.provider || order?.provider || "mock";

   if (provider === "razorpay") {
    if (!order?.id) {
     throw new Error("Unable to create Razorpay order for renewal.");
    }

    const razorpayResponse = await openRazorpayCheckout({
     order,
     keyId: gateway?.keyId || "",
     selectedMethod: paymentMethod,
     customer: orderResponse?.customer || {},
     policy: orderResponse?.policy || { id: policyId, name: payload?.policyName || "Policy Renewal" },
    });

    paymentMeta = {
     orderId: razorpayResponse?.razorpay_order_id,
     paymentId: razorpayResponse?.razorpay_payment_id,
     signature: razorpayResponse?.razorpay_signature,
    };
   } else {
    paymentMeta = {
     orderId: order?.id || `order_${Date.now()}`,
     paymentId: payload?.paymentId || `pay_${Date.now()}`,
     signature: payload?.signature || "mock_signature",
    };
   }
  }

  const { data } = await api.post("/payments/renew", {
   purchaseId,
   policyId,
   amount,
   paymentMethod,
   autoRenewalFlag: payload?.autoRenewalFlag,
   ...paymentMeta,
  });
  return data;
 } catch (error) {
  // Backward compatibility: fallback to legacy purchase flow when renewal route is unavailable.
  if (error?.response?.status !== 404) {
   throw error;
  }

  if (!policyId) {
   throw new Error("Policy ID is required for renewal fallback.");
  }

  const order = await createPaymentOrder(policyId, payload?.amount);
  const orderId = order?.order?.id || order?.orderId;

  if (!orderId) {
   throw new Error("Unable to create payment order for renewal.");
  }

  return verifyPayment({
   policyId,
   orderId,
   paymentId: payload?.paymentId || `pay_${Date.now()}`,
   signature: payload?.signature || "mock_signature",
   paymentMethod: payload?.paymentMethod || "upi",
  });
 }
}
