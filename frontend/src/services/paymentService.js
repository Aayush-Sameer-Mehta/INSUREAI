import api from "./api";

export const createPaymentIntent = async (policyId) => {
 const { data } = await api.post("/payments/create-intent", { policyId });
 return data;
};

export const createPaymentOrder = async (policyId, amount) => {
 const { data } = await api.post("/payments/create-order", { policyId, amount });
 return data;
};

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
