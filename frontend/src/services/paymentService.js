import api from "./api";

export const createPaymentIntent = async (policyId) => {
 const { data } = await api.post("/payments/create-intent", { policyId });
 return data;
};

export const createPaymentOrder = async (policyId, amount) => {
 const { data } = await api.post("/payments/create-order", { policyId, amount });
 return data;
};

let razorpayScriptPromise = null;

function loadRazorpayScript() {
 if (typeof window === "undefined") return Promise.resolve(false);
 if (window.Razorpay) return Promise.resolve(true);
 if (razorpayScriptPromise) return razorpayScriptPromise;

 razorpayScriptPromise = new Promise((resolve) => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
 });

 return razorpayScriptPromise;
}

function buildMethodOptions(selectedMethod) {
 switch (selectedMethod) {
 case "upi":
  return {
   upi: true,
   card: false,
   netbanking: false,
   wallet: false,
   paylater: false,
   emi: false,
  };
 case "card":
  return {
   upi: false,
   card: true,
   netbanking: false,
   wallet: false,
   paylater: false,
   emi: false,
  };
 case "netbanking":
  return {
   upi: false,
   card: false,
   netbanking: true,
   wallet: false,
   paylater: false,
   emi: false,
  };
 case "wallet":
  return {
   upi: false,
   card: false,
   netbanking: false,
   wallet: true,
   paylater: false,
   emi: false,
  };
 default:
  return undefined;
 }
}

export async function openRazorpayCheckout({
 order,
 keyId,
 selectedMethod,
 customer,
 policy,
}) {
 const loaded = await loadRazorpayScript();
 if (!loaded || !window.Razorpay) {
  throw new Error("Razorpay checkout failed to load.");
 }

 if (!keyId) {
  throw new Error("Razorpay key is missing in backend configuration.");
 }

 return new Promise((resolve, reject) => {
  const rz = new window.Razorpay({
   key: keyId,
   amount: Number(order?.amount || 0),
   currency: order?.currency || "INR",
   name: "InsureAI",
   description: policy?.name ? `Policy Purchase - ${policy.name}` : "Policy Purchase",
   order_id: order?.id,
   prefill: {
    name: customer?.fullName || "",
    email: customer?.email || "",
    contact: customer?.mobileNumber || "",
   },
   notes: {
    policyId: String(policy?.id || ""),
   },
   method: buildMethodOptions(selectedMethod),
   theme: { color: "#4f46e5" },
   handler: (response) => resolve(response),
   modal: {
    ondismiss: () => reject(new Error("Payment cancelled by user.")),
   },
  });

  rz.on("payment.failed", (response) => {
   reject(
    new Error(
     response?.error?.description ||
      response?.error?.reason ||
      "Payment failed. Please try again.",
    ),
   );
  });

  rz.open();
 });
}

export const confirmPayment = async (policyId, paymentMethod) => {
 const order = await createPaymentOrder(policyId);
 const orderId = order?.order?.id || order?.orderId;

 if (!orderId) {
  throw new Error("Payment order could not be created.");
 }

 return verifyPayment({
  policyId,
  orderId,
  paymentId: `pay_${Date.now()}`,
  signature: "mock_signature",
  paymentMethod: paymentMethod || "upi",
 });
};

export const verifyPayment = async (payload) => {
 const { data } = await api.post("/payments/verify", payload);
 return data;
};
