export const formatCurrency = (amount) =>
 new Intl.NumberFormat("en-IN", {
 style: "currency",
 currency: "INR",
 maximumFractionDigits: 0
 }).format(Number(amount || 0));

export const toTitleCase = (value = "") =>
 value
 .split(" ")
 .filter(Boolean)
 .map((part) => part[0].toUpperCase() + part.slice(1))
 .join(" ");
