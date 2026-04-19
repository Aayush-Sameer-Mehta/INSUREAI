import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Upload, Brain } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { createClaim, analyzeClaimAI, uploadClaimDocuments } from "../../services/claimService";
import { formatCurrency } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { Button, Input, Select, Modal } from "../../components/common";
import AIInsightPanel, { ClaimSuccessScore } from "../../components/AIInsightPanel";
import {
  claimDocumentsSchema,
  claimSchema,
  MAX_CLAIM_FILE_SIZE_BYTES,
  SUPPORTED_CLAIM_FILE_TYPES,
} from "../../validation";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";

export default function FileClaimModal({ open, onClose, policies = [], onSuccess }) {
  const [documents, setDocuments] = useState([]);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting, submitCount, isValid },
  } = useForm({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      selectedPolicy: "",
      claimAmount: "",
      claimCategory: "reimbursement",
      incidentDate: "",
      description: "",
      hospitalName: "",
      hospitalAddress: "",
      isNetworkHospital: false,
      isEmergency: false,
      bankAccountNumber: "",
      bankIfscCode: "",
      documents: [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

 useScrollToFirstError(errors, submitCount);

 const watchPolicy = watch("selectedPolicy");
 const watchAmount = watch("claimAmount");
 const watchDesc = watch("description");
 const watchDate = watch("incidentDate");

 const debouncedAmount = useDebounce(watchAmount, 800);
 const debouncedDescription = useDebounce(watchDesc, 800);

 const runAIAnalysis = useCallback(async () => {
 if (!watchPolicy || !debouncedAmount || !debouncedDescription || !watchDate) return;
 setAiLoading(true);
 try {
 const result = await analyzeClaimAI({
 policyId: watchPolicy,
  claimAmount: Number(debouncedAmount),
 incidentDate: watchDate,
 description: debouncedDescription,
 documents: (documents || []).map((f) => f.name),
 });
 setAiAnalysis(result);
 } catch {
 // Non-blocking
 } finally {
 setAiLoading(false);
 }
 }, [watchPolicy, debouncedAmount, debouncedDescription, watchDate, documents]);

 useEffect(() => {
 if (watchPolicy && debouncedAmount && debouncedDescription && watchDate) {
 runAIAnalysis();
 }
 }, [watchPolicy, debouncedAmount, debouncedDescription, watchDate, runAIAnalysis]);

 const currentPolicy = (policies || []).find((p) => (p.policy?._id || p.policy?.policyId) === watchPolicy);
 const currentMaxAmount = currentPolicy?.policy?.maxAmount || currentPolicy?.policy?.coverage || 0;
 const isHealthRelated = ["health", "personal_accident"].includes(currentPolicy?.policy?.category);

 // Validate coverage limit dynamically
 useEffect(() => {
 if (watchAmount && currentMaxAmount > 0) {
 if (Number(watchAmount) > currentMaxAmount) {
 setError("claimAmount", { type: "manual", message: `Amount exceeds coverage limit of ${formatCurrency(currentMaxAmount)}` });
 } else {
 clearErrors("claimAmount");
 }
 }
 }, [watchAmount, currentMaxAmount, setError, clearErrors]);

 const handleFileChange = (event) => {
 const files = Array.from(event.target.files || []);
 const parsed = claimDocumentsSchema.safeParse(files);

 if (!parsed.success) {
 const firstMessage = parsed.error.issues?.[0]?.message || "Invalid file upload";
 setError("documents", { type: "manual", message: firstMessage });
 setDocuments([]);
 setValue("documents", [], { shouldValidate: true });
 return;
 }

 clearErrors("documents");
 setDocuments(files);
 setValue("documents", files, { shouldValidate: true, shouldDirty: true });
 };

 const handleClose = () => {
 reset();
 setDocuments([]);
 setAiAnalysis(null);
 onClose();
 };

 const processSubmit = async (data) => {
 if (isSubmitting) return;

 if (currentMaxAmount > 0 && Number(data.claimAmount) > currentMaxAmount) {
 toast.error(`Claim amount cannot exceed policy maximum (${formatCurrency(currentMaxAmount)})`);
 return;
 }

 try {
 // Step 1: Upload real files if any
 let uploadedPaths = [];
 if (documents.length > 0) {
 const uploadResult = await uploadClaimDocuments(documents);
 uploadedPaths = (uploadResult?.files || []).map((f) => f.path);
 }

 // Step 2: Create the claim with uploaded file paths
 await createClaim({
 policyId: data.selectedPolicy,
 reason: data.description,
 claimAmount: Number(data.claimAmount),
 incidentDate: data.incidentDate,
 documents: uploadedPaths,
 hospitalDetails: isHealthRelated ? {
 name: data.hospitalName,
 address: data.hospitalAddress,
 isNetworkHospital: data.isNetworkHospital,
 } : undefined,
 payoutBankDetails: {
 accountNumber: data.bankAccountNumber,
 ifscCode: data.bankIfscCode,
 },
 });
 toast.success("Claim filed successfully");
 handleClose();
 onSuccess?.();
 } catch (error) {
 toast.error(error.response?.data?.message || "Failed to file claim");
 }
 };

 return (
 <Modal
 open={open}
 onClose={handleClose}
 title="File New Claim"
 description="Submit a new insurance claim request"
 size="lg"
 footer={
 <div className="flex w-full items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 {aiAnalysis && <ClaimSuccessScore probability={aiAnalysis.approvalProbability} />}
 </div>
 <div className="flex gap-3">
 <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
 <Button
 type="submit"
 form="claim-form"
 loading={isSubmitting}
 disabled={policies.length === 0 || isSubmitting || !isValid}
 >
 Submit Claim
 </Button>
 </div>
 </div>
 }
 >
 <form id="claim-form" onSubmit={handleSubmit(processSubmit)} className="space-y-6" noValidate>
 {policies.length === 0 ? (
 <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 ">
 <div className="flex items-start gap-3">
 <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 " />
 <div>
 <h4 className="text-sm font-semibold text-amber-800 ">No Active Policies</h4>
 <p className="mt-1 text-sm text-amber-700 ">You need an active policy to file a claim.</p>
 <Link to="/policies" className="mt-2 inline-block text-sm font-medium text-amber-800 underline ">Browse Policies</Link>
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-5">
 {/* Claim Details */}
 <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ">
 <div className="mb-4 flex items-start justify-between gap-4">
 <div>
 <p className="text-sm font-semibold text-slate-900 ">Claim details</p>
 <p className="mt-1 text-xs text-slate-500 ">Choose your policy and enter the incident information.</p>
 </div>
 {watchPolicy && (
 <div className="rounded-xl bg-primary-50 px-3 py-2 text-right ">
 <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600 ">Coverage limit</p>
 <p className="mt-1 text-sm font-bold text-slate-900 ">{formatCurrency(currentMaxAmount)}</p>
 </div>
 )}
 </div>

 <div className="space-y-4">
 <div className="grid gap-4 sm:grid-cols-2">
  <Select label="Claim Category" {...register("claimCategory")} error={errors.claimCategory?.message}>
   <option value="reimbursement">Reimbursement (Post-care)</option>
   <option value="cashless">Cashless (Pre-approval)</option>
  </Select>
  <Select label="Select Policy" {...register("selectedPolicy")} error={errors.selectedPolicy?.message}>
  <option value="">-- Choose a policy --</option>
  {policies.map((p) => (
  <option key={p._id} value={p.policy?._id || p.policy?.policyId || ""}>
  {p.policy?.name || "Unknown Policy"} (Max: {formatCurrency(p.policy?.maxAmount || p.policy?.coverage || 0)})
  </option>
  ))}
  </Select>
 </div>

 <div className="grid gap-4 sm:grid-cols-3">
  <Input 
  label="Claim Amount (₹)" 
  type="number" 
  placeholder="e.g. 50000" 
  {...register("claimAmount")}
  helper={watchPolicy ? `Max allowed: ${formatCurrency(currentMaxAmount)}` : "Select a policy first"}
  error={errors.claimAmount?.message}
  />
  <Input 
  label="Incident Date" 
  type="date" 
  max={new Date().toISOString().split("T")[0]} 
  {...register("incidentDate")}
  error={errors.incidentDate?.message}
  />
  <div className="flex items-center pt-8 justify-center">
    <Controller
      name="isEmergency"
      control={control}
      render={({ field }) => (
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500" />
          <span className="text-sm font-bold text-red-600">Emergency Claim</span>
        </label>
      )}
    />
  </div>
 </div>

 <div>
 <label className="field-label">Description / Diagnosis</label>
 <textarea 
 className={`field min-h-[128px] resize-y ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
 placeholder="Describe what happened, the diagnosis, and why this claim is being filed." 
 {...register("description")} 
 rows={4} 
 />
 {errors.description ? (
 <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
 ) : (
 <p className="field-helper">A clear description helps the AI pre-approve faster.</p>
 )}
 {watchDesc && watchDesc.trim().split(/\s+/).length < 15 && !errors.description && (
 <p className="mt-1 text-xs text-amber-600 ">⚠ Tip: Add more detail to improve your approval chances.</p>
 )}
 </div>
 </div>
 </div>

 {/* Hospital Details */}
 {isHealthRelated && (
 <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ">
 <div className="mb-4">
 <p className="text-sm font-semibold text-slate-900 ">Hospital & Treatment Details</p>
 <p className="mt-1 text-xs text-slate-500 ">Provide information about the treating facility.</p>
 </div>
 <div className="space-y-4">
 <div className="grid sm:grid-cols-2 gap-4">
  <Input label="Hospital Name" placeholder="e.g. Apollo Hospitals" {...register("hospitalName")} error={errors.hospitalName?.message} />
  <Input label="Hospital Address / City" placeholder="e.g. Jubilee Hills, Hyderabad" {...register("hospitalAddress")} error={errors.hospitalAddress?.message} />
 </div>
 <Controller
    name="isNetworkHospital"
    control={control}
    render={({ field }) => (
       <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 cursor-pointer transition w-fit">
       <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600 " 
       checked={field.value}
       onChange={field.onChange}
       />
       <span className="text-sm font-medium text-slate-700 ">Verify as Cashless Network Hospital</span>
       </label>
    )}
 />
 </div>
 </div>
 )}

 {/* Bank Details */}
 <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ">
 <div className="mb-4">
 <p className="text-sm font-semibold text-slate-900 ">Bank Details</p>
 <p className="mt-1 text-xs text-slate-500 ">Account details for your claim settlement payout.</p>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 <Input label="Account Number" placeholder="Enter your account number" {...register("bankAccountNumber")} error={errors.bankAccountNumber?.message} />
 <Input label="IFSC Code" placeholder="e.g. HDFC0001234" {...register("bankIfscCode")} error={errors.bankIfscCode?.message} 
 onChange={(e) => {
 setValue("bankIfscCode", e.target.value.toUpperCase(), { shouldValidate: true })
 }}
 />
 </div>
 </div>

 {/* Document Upload */}
 <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm ">
 <div className="mb-3">
 <p className="text-sm font-semibold text-slate-900 ">Supporting documents</p>
 <p className="mt-1 text-xs text-slate-500 ">Upload photos, reports, or PDFs to support your claim.</p>
 </div>
 <div className="mt-1 flex w-full items-center justify-center">
 <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-10 transition hover:border-primary-300 hover:bg-primary-50/40 ">
 <div className="flex flex-col items-center justify-center text-center">
 <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 ">
 <Upload className="h-7 w-7 text-primary-500" />
 </div>
 <p className="mb-1 text-sm text-slate-600 ">
 <span className="font-semibold text-primary-600 ">Choose files</span> or drag and drop
 </p>
 <p className="text-xs text-slate-500">
 {SUPPORTED_CLAIM_FILE_TYPES.map((type) => type.split("/")[1].toUpperCase()).join(", ")} files, up to{" "}
 {Math.round(MAX_CLAIM_FILE_SIZE_BYTES / (1024 * 1024))}MB each
 </p>
 {documents.length > 0 && (
 <div className="mt-5 flex flex-wrap justify-center gap-2">
 {documents.map((f, i) => (
 <span key={i} className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 ">{f.name}</span>
 ))}
 </div>
 )}
 </div>
 <input type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileChange} />
 </label>
 </div>
 {errors.documents?.message && (
 <p className="mt-3 text-xs font-medium text-red-600" role="alert">
 {errors.documents.message}
 </p>
 )}
 </div>

 {/* AI Analysis */}
 <div className="space-y-3">
 {!aiAnalysis && !aiLoading && watchPolicy && watchAmount && (
 <Button type="button" variant="outline" onClick={runAIAnalysis} className="w-full" icon={Brain}>
 Analyze Claim with AI
 </Button>
 )}
 <AIInsightPanel analysis={aiAnalysis} loading={aiLoading} />
 {aiAnalysis && aiAnalysis.approvalProbability < 40 && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 ">
 <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
 <div>
 <p className="text-xs font-semibold text-red-700 ">Low Approval Probability</p>
 <p className="text-xs text-red-600 ">Consider adding more details and supporting documents to increase your chances.</p>
 </div>
 </motion.div>
 )}
 </div>
 </div>
 )}
 </form>
 </Modal>
 );
}
