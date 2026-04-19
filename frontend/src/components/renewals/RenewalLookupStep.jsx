import { AlertCircle, FileSearch, FileText, Search, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Input } from "../common";

export default function RenewalLookupStep({
 insuranceTypeLabel,
 lookupValue,
 onLookupValueChange,
 detectedKind,
 validationError,
 helperMessage,
 onSubmit,
 loading,
}) {
 const detectionMeta = {
 vehicle: {
 label: "Vehicle number detected",
 description: "We will use this registration number to pull your motor renewal details.",
 icon: Search,
 tone: "text-sky-700 bg-sky-50 ",
 },
 policy: {
 label: "Policy number detected",
 description: "We will search directly by policy identifier and insurer record.",
 icon: FileText,
 tone: "text-violet-700 bg-violet-50 ",
 },
 unknown: {
 label: "Lookup format not clear yet",
 description: "Enter a valid policy number or Indian vehicle number to continue.",
 icon: AlertCircle,
 tone: "text-amber-700 bg-amber-50 ",
 },
 }[detectedKind || "unknown"];

 const DetectionIcon = detectionMeta.icon;

 return (
 <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
 <motion.form
 onSubmit={onSubmit}
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm "
 >
 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary-600 ">
 <FileSearch className="h-4 w-4" />
 Renewal Lookup
 </div>
 <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900 ">
 Search your {insuranceTypeLabel.toLowerCase()} renewal details
 </h3>
 <p className="mt-2 text-sm leading-6 text-slate-500 ">
 Enter your policy number or vehicle number. We will auto-detect the input format when possible.
 </p>

 <div className="mt-6">
 <Input
 icon={Search}
 label="Policy Number or Vehicle Number"
 placeholder="Example: PB12345678 or GJ01AB1234"
 value={lookupValue}
 onChange={(event) => onLookupValueChange(event.target.value)}
 error={validationError}
 helper={helperMessage}
 className="h-12"
 />
 </div>

 <div className="mt-6 flex flex-col gap-3 sm:flex-row">
 <Button type="submit" loading={loading} icon={Search} className="sm:min-w-48">
 Fetch Policy Details
 </Button>
 <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ">
 <ShieldCheck className="h-4 w-4 text-emerald-500" />
 Secure renewal search
 </div>
 </div>
 </motion.form>

 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm "
 >
 <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${detectionMeta.tone}`}>
 <DetectionIcon className="h-3.5 w-3.5" />
 {detectionMeta.label}
 </div>

 <p className="mt-4 text-sm leading-6 text-slate-600 ">{detectionMeta.description}</p>

 <div className="mt-6 space-y-3 text-sm">
 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ">
 Policy number: best for all insurance types, including health and life plans.
 </div>
 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ">
 Vehicle number: supported for car and bike renewals with auto-format detection.
 </div>
 </div>
 </motion.div>
 </div>
 );
}
