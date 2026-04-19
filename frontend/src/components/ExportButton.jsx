import { Download } from "lucide-react";

/*
 * Generates a CSV string from purchased policies and triggers a download.
 * No external library needed — works purely in the browser.
 */
function generateCSV(profile) {
 const rows = [
 ["Policy Name", "Company", "Category", "Premium Paid (₹)", "Coverage (₹)", "Purchase Date"],
 ];

 (profile?.purchasedPolicies || []).forEach((item) => {
 const p = item.policy || {};
 rows.push([
 `"${p.name || "N/A"}"`,
 `"${p.company || "N/A"}"`,
 `"${(p.category || "N/A").charAt(0).toUpperCase() + (p.category || "").slice(1)}"`,
 item.amount || 0,
 p.coverageAmount || p.coverage || 0,
 new Date(item.purchasedAt).toLocaleDateString("en-IN"),
 ]);
 });

 return rows.map((r) => r.join(",")).join("\n");
}

function downloadFile(content, filename, type = "text/csv") {
 const blob = new Blob([content], { type });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

export default function ExportButton({ profile }) {
 const count = profile?.purchasedPolicies?.length || 0;

 const handleExport = () => {
 const csv = generateCSV(profile);
 const date = new Date().toISOString().split("T")[0];
 downloadFile(csv, `InsureAI_Portfolio_${date}.csv`);
 };

 return (
 <button
 type="button"
 onClick={handleExport}
 disabled={count === 0}
 className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20 hover:scale-[1.04] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
 >
 <Download className="h-4 w-4 text-cyan-300" />
 Export Portfolio
 </button>
 );
}
