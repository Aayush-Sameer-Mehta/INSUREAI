import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
 CalendarClock,
 CheckCircle2,
 ChevronRight,
 CircleAlert,
 ClipboardList,
 Filter,
 Mail,
 Phone,
 Plus,
 Search,
 ShieldCheck,
 Sparkles,
 Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Input, Modal } from "../../../components/common";
import agentWorkspaceService from "../../../services/agentWorkspaceService";

const defaultCustomerForm = {
 fullName: "",
 email: "",
 password: "",
 mobileNumber: "",
 city: "",
 state: "",
 risk_profile: "Medium",
};

const defaultWorkflowForm = {
 status: "Active",
 priority: "Medium",
 preferredContactChannel: "Phone",
 onboardingStage: "Assigned",
 nextFollowUpAt: "",
 notes: "",
};

const defaultFollowUpForm = {
 dueAt: "",
 type: "Call",
 notes: "",
 outcome: "",
 status: "Scheduled",
};

function formatDate(value, fallback = "Not available") {
 if (!value) return fallback;
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return fallback;
 return date.toLocaleDateString("en-IN", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 });
}

function formatDateTime(value, fallback = "Not scheduled") {
 if (!value) return fallback;
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return fallback;
 return date.toLocaleString("en-IN", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 });
}

function formatCurrency(amount) {
 return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function getFollowUpTone(status) {
 switch (status) {
 case "Completed":
 return "bg-emerald-50 text-emerald-700";
 case "Missed":
 return "bg-rose-50 text-rose-700";
 case "Cancelled":
 return "bg-slate-100 text-slate-600";
 default:
 return "bg-amber-50 text-amber-700";
 }
}

function getWorkflowTone(priority) {
 switch (priority) {
 case "Critical":
 return "bg-rose-50 text-rose-700";
 case "High":
 return "bg-amber-50 text-amber-700";
 case "Low":
 return "bg-emerald-50 text-emerald-700";
 default:
 return "bg-sky-50 text-sky-700";
 }
}

function deriveCustomerInsights(customer, detail) {
 const purchasedPolicies = customer?.purchasedPolicies || [];
 const claims = detail?.claims || [];
 const commissions = detail?.commissions || [];
 const followUps = customer?.agent_workflow?.followUps || [];
 const scheduledFollowUps = followUps.filter((item) => item.status === "Scheduled");
 const completedFollowUps = followUps.filter((item) => item.status === "Completed");

 return {
 policiesCount: purchasedPolicies.length,
 claimsCount: claims.length,
 premiumValue: commissions.reduce((sum, item) => sum + (item.premium_amount || 0), 0),
 pendingCommission: commissions
 .filter((item) => item.commission_status === "Pending")
 .reduce((sum, item) => sum + (item.commission_amount || 0), 0),
 nextFollowUpAt: customer?.agent_workflow?.nextFollowUpAt || scheduledFollowUps[0]?.dueAt || null,
 scheduledFollowUps: scheduledFollowUps.length,
 completedFollowUps: completedFollowUps.length,
 };
}

function AgentPanelCard({ title, description, action, children, className = "" }) {
 return (
 <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
 <div className="mb-4 flex items-start justify-between gap-3">
 <div>
 <h2 className="text-lg font-bold text-slate-900">{title}</h2>
 {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
 </div>
 {action}
 </div>
 {children}
 </section>
 );
}

export default function ClientsList() {
 const [searchParams, setSearchParams] = useSearchParams();
 const [initialSelectedCustomerId] = useState(() => searchParams.get("client") || "");
 const [customers, setCustomers] = useState([]);
 const [selectedCustomerId, setSelectedCustomerId] = useState(initialSelectedCustomerId);
 const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
 const [search, setSearch] = useState("");
 const [riskFilter, setRiskFilter] = useState("All");
 const [statusFilter, setStatusFilter] = useState("All");
 const [priorityFilter, setPriorityFilter] = useState("All");
 const [sortBy, setSortBy] = useState("followUp");
 const [loading, setLoading] = useState(true);
 const [detailLoading, setDetailLoading] = useState(false);
 const [saveWorkflowLoading, setSaveWorkflowLoading] = useState(false);
 const [followUpLoading, setFollowUpLoading] = useState(false);
 const [createCustomerLoading, setCreateCustomerLoading] = useState(false);
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [customerForm, setCustomerForm] = useState(defaultCustomerForm);
 const [workflowForm, setWorkflowForm] = useState(defaultWorkflowForm);
 const [followUpForm, setFollowUpForm] = useState(defaultFollowUpForm);

 useEffect(() => {
 let isMounted = true;

 async function loadCustomers() {
 try {
 const data = await agentWorkspaceService.getCustomers();
 if (!isMounted) return;
 setCustomers(data);

 const resolvedId = initialSelectedCustomerId || data[0]?._id || "";
 setSelectedCustomerId(resolvedId);
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to load customer portfolio");
 } finally {
 if (isMounted) {
 setLoading(false);
 }
 }
 }

 loadCustomers();

 return () => {
 isMounted = false;
 };
 }, [initialSelectedCustomerId]);

 useEffect(() => {
 const requestedId = searchParams.get("client");
 if (requestedId && requestedId !== selectedCustomerId) {
 setSelectedCustomerId(requestedId);
 }
 }, [searchParams, selectedCustomerId]);

 useEffect(() => {
 let isMounted = true;

 async function loadCustomerDetail() {
 if (!selectedCustomerId) {
 setSelectedCustomerDetail(null);
 return;
 }

 setDetailLoading(true);
 try {
 const data = await agentWorkspaceService.getCustomerDetail(selectedCustomerId);
 if (!isMounted) return;
 setSelectedCustomerDetail(data);
 syncWorkflowForm(data.customer);
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to load customer details");
 } finally {
 if (isMounted) {
 setDetailLoading(false);
 }
 }
 }

 loadCustomerDetail();

 return () => {
 isMounted = false;
 };
 }, [selectedCustomerId]);

 function syncWorkflowForm(customer) {
 setWorkflowForm({
 status: customer?.agent_workflow?.status || "Active",
 priority: customer?.agent_workflow?.priority || "Medium",
 preferredContactChannel: customer?.agent_workflow?.preferredContactChannel || "Phone",
 onboardingStage: customer?.agent_workflow?.onboardingStage || "Assigned",
 nextFollowUpAt: customer?.agent_workflow?.nextFollowUpAt
 ? new Date(customer.agent_workflow.nextFollowUpAt).toISOString().slice(0, 16)
 : "",
 notes: customer?.agent_workflow?.notes || "",
 });
 }

 function replaceCustomer(updatedCustomer) {
 if (!updatedCustomer?._id) return;
 setCustomers((current) =>
 current.map((customer) => (customer._id === updatedCustomer._id ? updatedCustomer : customer)),
 );
 }

 const filteredCustomers = useMemo(() => {
 const query = search.trim().toLowerCase();
 const enriched = customers.map((customer) => ({
 ...customer,
 workflowStatus: customer.agent_workflow?.status || "Active",
 workflowPriority: customer.agent_workflow?.priority || "Medium",
 nextFollowUpAt: customer.agent_workflow?.nextFollowUpAt || null,
 }));

 return enriched
 .filter((customer) => {
 if (query) {
 const matchesQuery = [customer.fullName, customer.email, customer.mobileNumber, customer.city, customer.state]
 .filter(Boolean)
 .some((value) => String(value).toLowerCase().includes(query));
 if (!matchesQuery) return false;
 }

 if (riskFilter !== "All" && customer.user_profile?.risk_profile !== riskFilter) {
 return false;
 }

 if (statusFilter !== "All" && customer.workflowStatus !== statusFilter) {
 return false;
 }

 if (priorityFilter !== "All" && customer.workflowPriority !== priorityFilter) {
 return false;
 }

 return true;
 })
 .sort((a, b) => {
 if (sortBy === "name") {
 return String(a.fullName || "").localeCompare(String(b.fullName || ""));
 }

 if (sortBy === "recent") {
 return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
 }

 const aTime = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Number.MAX_SAFE_INTEGER;
 const bTime = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Number.MAX_SAFE_INTEGER;
 return aTime - bTime;
 });
 }, [customers, search, riskFilter, statusFilter, priorityFilter, sortBy]);

 const selectedCustomer = useMemo(
 () => customers.find((customer) => customer._id === selectedCustomerId) || null,
 [customers, selectedCustomerId],
 );

 const selectedInsights = useMemo(
 () => deriveCustomerInsights(selectedCustomer, selectedCustomerDetail),
 [selectedCustomer, selectedCustomerDetail],
 );

 const portfolioSummary = useMemo(() => {
 const followUpToday = customers.filter((customer) => {
 const next = customer.agent_workflow?.nextFollowUpAt;
 if (!next) return false;
 const nextDate = new Date(next);
 const today = new Date();
 return nextDate.toDateString() === today.toDateString();
 }).length;

 const atRisk = customers.filter((customer) => customer.agent_workflow?.status === "At Risk").length;
 const highPriority = customers.filter((customer) => {
 const priority = customer.agent_workflow?.priority;
 return priority === "High" || priority === "Critical";
 }).length;

 return {
 total: customers.length,
 followUpToday,
 atRisk,
 highPriority,
 };
 }, [customers]);

 function handleSelectCustomer(customerId) {
 setSelectedCustomerId(customerId);
 const nextParams = new URLSearchParams(searchParams);
 nextParams.set("client", customerId);
 setSearchParams(nextParams, { replace: true });
 }

 async function handleCreateCustomer(event) {
 event.preventDefault();
 setCreateCustomerLoading(true);

 try {
 const created = await agentWorkspaceService.createCustomer({
 fullName: customerForm.fullName,
 email: customerForm.email,
 password: customerForm.password,
 mobileNumber: customerForm.mobileNumber,
 city: customerForm.city,
 state: customerForm.state,
 user_profile: {
 risk_profile: customerForm.risk_profile,
 },
 });

 const customer = {
 ...created,
 user_profile: {
 ...(created.user_profile || {}),
 risk_profile: created.user_profile?.risk_profile || customerForm.risk_profile,
 },
 agent_workflow: created.agent_workflow || {
 status: "New",
 priority: "Medium",
 preferredContactChannel: "Phone",
 onboardingStage: "Assigned",
 followUps: [],
 },
 };

 setCustomers((current) => [customer, ...current]);
 setCustomerForm(defaultCustomerForm);
 setIsCreateModalOpen(false);
 handleSelectCustomer(customer._id);
 toast.success("Customer added to your portfolio");
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to create customer");
 } finally {
 setCreateCustomerLoading(false);
 }
 }

 async function handleSaveWorkflow(event) {
 event.preventDefault();
 if (!selectedCustomerId) return;

 setSaveWorkflowLoading(true);
 try {
 const response = await agentWorkspaceService.updateWorkflow(selectedCustomerId, {
 ...workflowForm,
 nextFollowUpAt: workflowForm.nextFollowUpAt || null,
 });

 replaceCustomer(response.customer);
 setSelectedCustomerDetail((current) => ({
 ...(current || {}),
 customer: response.customer,
 }));
 syncWorkflowForm(response.customer);
 toast.success("Workflow updated");
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to update workflow");
 } finally {
 setSaveWorkflowLoading(false);
 }
 }

 async function handleCreateFollowUp(event) {
 event.preventDefault();
 if (!selectedCustomerId) return;

 setFollowUpLoading(true);
 try {
 const response = await agentWorkspaceService.addFollowUp(selectedCustomerId, followUpForm);
 replaceCustomer(response.customer);
 setSelectedCustomerDetail((current) => ({
 ...(current || {}),
 customer: response.customer,
 }));
 syncWorkflowForm(response.customer);
 setFollowUpForm(defaultFollowUpForm);
 toast.success("Follow-up scheduled");
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to create follow-up");
 } finally {
 setFollowUpLoading(false);
 }
 }

 async function handleCompleteFollowUp(followUpId) {
 if (!selectedCustomerId || !followUpId) return;

 try {
 const response = await agentWorkspaceService.updateFollowUp(selectedCustomerId, followUpId, {
 status: "Completed",
 });
 replaceCustomer(response.customer);
 setSelectedCustomerDetail((current) => ({
 ...(current || {}),
 customer: response.customer,
 }));
 syncWorkflowForm(response.customer);
 toast.success("Follow-up marked complete");
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to update follow-up");
 }
 }

 return (
 <div className="mx-auto max-w-7xl space-y-6 px-3 py-6 sm:px-6 lg:px-8">
 <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(37,99,235,0.95))] px-6 py-8 text-white shadow-xl sm:px-8">
 <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
 Agent Portfolio
 </p>
 <h1 className="mt-3 text-3xl font-bold tracking-tight">Customer workflow panel</h1>
 <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
 Manage assigned customers, track follow-ups, and keep every account moving from
 first contact to renewal support in one place.
 </p>
 </div>

 <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[26rem]">
 <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Follow-ups today</p>
 <p className="mt-2 text-3xl font-bold">{portfolioSummary.followUpToday}</p>
 </div>
 <div className="rounded-2xl bg-white/10 px-4 py-4 backdrop-blur">
 <p className="text-xs uppercase tracking-[0.2em] text-slate-200">At-risk accounts</p>
 <p className="mt-2 text-3xl font-bold">{portfolioSummary.atRisk}</p>
 </div>
 </div>
 </div>

 <div className="mt-6 flex flex-wrap gap-3">
 <Button icon={Plus} variant="secondary" className="!bg-white !text-slate-900 hover:!bg-slate-100" onClick={() => setIsCreateModalOpen(true)}>
 Add Customer
 </Button>
 <Link
 to="/agent/dashboard"
 className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
 >
 View dashboard
 <ChevronRight className="h-4 w-4" />
 </Link>
 </div>
 </section>

 <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {[
 { label: "Assigned customers", value: portfolioSummary.total, tone: "bg-slate-900 text-white" },
 { label: "High priority", value: portfolioSummary.highPriority, tone: "bg-amber-50 text-amber-700" },
 { label: "Needs follow-up", value: portfolioSummary.followUpToday, tone: "bg-sky-50 text-sky-700" },
 { label: "At risk", value: portfolioSummary.atRisk, tone: "bg-rose-50 text-rose-700" },
 ].map((item) => (
 <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
 <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
 {item.label}
 </span>
 <p className="mt-4 text-3xl font-bold text-slate-900">{item.value}</p>
 </div>
 ))}
 </section>

 <AgentPanelCard
 title="Portfolio filters"
 description="Search your accounts, narrow by workflow state, and prioritize the next best follow-up."
 action={
 <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
 <Filter className="h-3.5 w-3.5" />
 Live filters
 </div>
 }
 >
 <div className="grid gap-3 lg:grid-cols-[1.8fr_repeat(4,_1fr)]">
 <div className="relative">
 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 value={search}
 onChange={(event) => setSearch(event.target.value)}
 placeholder="Search by name, email, phone, city, or state"
 className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
 />
 </div>

 <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400">
 {["All", "Low", "Medium", "High"].map((value) => <option key={value}>{value}</option>)}
 </select>

 <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400">
 {["All", "New", "Active", "Needs Follow-Up", "At Risk", "Converted", "Dormant"].map((value) => <option key={value}>{value}</option>)}
 </select>

 <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400">
 {["All", "Low", "Medium", "High", "Critical"].map((value) => <option key={value}>{value}</option>)}
 </select>

 <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400">
 <option value="followUp">Sort by follow-up</option>
 <option value="recent">Sort by recency</option>
 <option value="name">Sort by name</option>
 </select>
 </div>
 </AgentPanelCard>

 <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
 <AgentPanelCard
 title="Customer portfolio"
 description="Select an account to inspect workflow status, activity, claims, and renewal follow-ups."
 >
 <div className="space-y-3">
 {loading && (
 <div className="flex min-h-[20vh] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
 <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
 </div>
 )}

 {!loading && filteredCustomers.map((customer) => {
 const isSelected = selectedCustomerId === customer._id;
 return (
 <button
 key={customer._id}
 type="button"
 onClick={() => handleSelectCustomer(customer._id)}
 className={`w-full rounded-3xl border p-4 text-left transition ${
 isSelected
 ? "border-sky-300 bg-sky-50 shadow-sm"
 : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
 }`}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <p className="truncate text-lg font-bold text-slate-900">{customer.fullName}</p>
 <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getWorkflowTone(customer.agent_workflow?.priority || "Medium")}`}>
 {customer.agent_workflow?.priority || "Medium"}
 </span>
 </div>
 <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
 <span className="inline-flex items-center gap-1.5">
 <Mail className="h-3.5 w-3.5" />
 {customer.email || "No email"}
 </span>
 <span className="inline-flex items-center gap-1.5">
 <Phone className="h-3.5 w-3.5" />
 {customer.mobileNumber || "No phone"}
 </span>
 </div>
 </div>
 <ChevronRight className={`h-5 w-5 shrink-0 text-slate-400 transition ${isSelected ? "translate-x-1 text-sky-600" : ""}`} />
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 {customer.agent_workflow?.status || "Active"}
 </span>
 <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
 {customer.user_profile?.risk_profile || "Medium"} Risk
 </span>
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 Follow-up {formatDateTime(customer.agent_workflow?.nextFollowUpAt, "Pending")}
 </span>
 </div>
 </button>
 );
 })}

 {!loading && !filteredCustomers.length && (
 <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
 <Users className="mx-auto h-8 w-8 text-slate-300" />
 <p className="mt-4 text-lg font-semibold text-slate-700">No customers match this view</p>
 <p className="mt-2 text-sm text-slate-500">
 Adjust the filters or add a new customer to start building your portfolio.
 </p>
 </div>
 )}
 </div>
 </AgentPanelCard>

 <div className="space-y-6">
 <AgentPanelCard
 title={selectedCustomer ? selectedCustomer.fullName : "Customer detail"}
 description={
 selectedCustomer
 ? `${selectedCustomer.city || "City not set"}${selectedCustomer.state ? `, ${selectedCustomer.state}` : ""}`
 : "Choose a customer from the portfolio list."
 }
 action={
 selectedCustomer && (
 <div className="flex flex-wrap gap-2">
 <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getWorkflowTone(selectedCustomer.agent_workflow?.priority || "Medium")}`}>
 {selectedCustomer.agent_workflow?.priority || "Medium"} priority
 </span>
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 {selectedCustomer.agent_workflow?.status || "Active"}
 </span>
 </div>
 )
 }
 >
 {!selectedCustomer && (
 <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
 <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
 <p className="mt-4 text-lg font-semibold text-slate-700">Select a customer</p>
 <p className="mt-2 text-sm text-slate-500">
 Their workflow, claims, commissions, and follow-ups will appear here.
 </p>
 </div>
 )}

 {selectedCustomer && detailLoading && (
 <div className="flex min-h-[18vh] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
 <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
 </div>
 )}

 {selectedCustomer && !detailLoading && (
 <div className="space-y-6">
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {[
 { label: "Policies", value: selectedInsights.policiesCount, icon: ShieldCheck },
 { label: "Claims", value: selectedInsights.claimsCount, icon: ClipboardList },
 { label: "Premium value", value: formatCurrency(selectedInsights.premiumValue), icon: Sparkles },
 { label: "Pending commission", value: formatCurrency(selectedInsights.pendingCommission), icon: CircleAlert },
 ].map((item) => {
 const Icon = item.icon;
 return (
 <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
 <div className="flex items-center justify-between">
 <p className="text-sm font-medium text-slate-500">{item.label}</p>
 <Icon className="h-4 w-4 text-slate-400" />
 </div>
 <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
 </div>
 );
 })}
 </div>

 <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
 <div className="space-y-6">
 <div className="rounded-3xl border border-slate-200 p-4">
 <h3 className="font-semibold text-slate-900">Contact snapshot</h3>
 <div className="mt-4 space-y-3 text-sm text-slate-600">
 <p><span className="font-medium text-slate-900">Email:</span> {selectedCustomer.email || "Not set"}</p>
 <p><span className="font-medium text-slate-900">Phone:</span> {selectedCustomer.mobileNumber || "Not set"}</p>
 <p><span className="font-medium text-slate-900">Joined:</span> {formatDate(selectedCustomer.createdAt)}</p>
 <p><span className="font-medium text-slate-900">Preferred contact:</span> {selectedCustomer.agent_workflow?.preferredContactChannel || "Phone"}</p>
 <p><span className="font-medium text-slate-900">Next follow-up:</span> {formatDateTime(selectedInsights.nextFollowUpAt)}</p>
 </div>
 </div>

 <div className="rounded-3xl border border-slate-200 p-4">
 <h3 className="font-semibold text-slate-900">Policy overview</h3>
 <div className="mt-4 space-y-3">
 {(selectedCustomer.purchasedPolicies || []).slice(0, 4).map((purchase) => (
 <div key={purchase._id || purchase.policy?._id} className="rounded-2xl bg-slate-50 px-4 py-3">
 <p className="font-semibold text-slate-900">{purchase.policy?.name || "Policy"}</p>
 <p className="text-sm text-slate-500">{purchase.policy?.company || "Insurance company"}</p>
 <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
 <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">{purchase.paymentStatus || "Paid"}</span>
 <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">{formatCurrency(purchase.amount)}</span>
 </div>
 </div>
 ))}
 {!selectedCustomer.purchasedPolicies?.length && (
 <p className="text-sm text-slate-500">No policies attached to this customer yet.</p>
 )}
 </div>
 </div>
 </div>

 <form onSubmit={handleSaveWorkflow} className="space-y-4 rounded-3xl border border-slate-200 p-4">
 <div>
 <h3 className="font-semibold text-slate-900">Workflow controls</h3>
 <p className="mt-1 text-sm text-slate-500">
 Keep stage, priority, and next action aligned for this account.
 </p>
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Status</span>
 <select value={workflowForm.status} onChange={(event) => setWorkflowForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400">
 {["New", "Active", "Needs Follow-Up", "At Risk", "Converted", "Dormant"].map((value) => <option key={value}>{value}</option>)}
 </select>
 </label>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Priority</span>
 <select value={workflowForm.priority} onChange={(event) => setWorkflowForm((current) => ({ ...current, priority: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400">
 {["Low", "Medium", "High", "Critical"].map((value) => <option key={value}>{value}</option>)}
 </select>
 </label>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Contact channel</span>
 <select value={workflowForm.preferredContactChannel} onChange={(event) => setWorkflowForm((current) => ({ ...current, preferredContactChannel: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400">
 {["Phone", "Email", "WhatsApp", "SMS"].map((value) => <option key={value}>{value}</option>)}
 </select>
 </label>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Onboarding stage</span>
 <select value={workflowForm.onboardingStage} onChange={(event) => setWorkflowForm((current) => ({ ...current, onboardingStage: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400">
 {["Assigned", "Contacted", "Qualified", "Proposal Shared", "Converted"].map((value) => <option key={value}>{value}</option>)}
 </select>
 </label>
 </div>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Next follow-up</span>
 <input
 type="datetime-local"
 value={workflowForm.nextFollowUpAt}
 onChange={(event) => setWorkflowForm((current) => ({ ...current, nextFollowUpAt: event.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
 />
 </label>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Internal notes</span>
 <textarea
 rows={5}
 value={workflowForm.notes}
 onChange={(event) => setWorkflowForm((current) => ({ ...current, notes: event.target.value }))}
 placeholder="Add context for the next advisor touchpoint, objections, or renewal plan."
 className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
 />
 </label>

 <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
 <span>Last contacted</span>
 <span className="font-semibold text-slate-900">
 {formatDateTime(selectedCustomer.agent_workflow?.lastContactedAt)}
 </span>
 </div>

 <Button type="submit" loading={saveWorkflowLoading} icon={CheckCircle2} className="w-full">
 Save workflow
 </Button>
 </form>
 </div>

 <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
 <form onSubmit={handleCreateFollowUp} className="space-y-4 rounded-3xl border border-slate-200 p-4">
 <div>
 <h3 className="font-semibold text-slate-900">Schedule a follow-up</h3>
 <p className="mt-1 text-sm text-slate-500">
 Create the next action so this account never slips out of view.
 </p>
 </div>

 <div className="grid gap-3 md:grid-cols-2">
 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Due date</span>
 <input
 type="datetime-local"
 value={followUpForm.dueAt}
 onChange={(event) => setFollowUpForm((current) => ({ ...current, dueAt: event.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
 required
 />
 </label>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Type</span>
 <select value={followUpForm.type} onChange={(event) => setFollowUpForm((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400">
 {["Call", "Email", "WhatsApp", "Meeting", "Renewal", "Document", "Other"].map((value) => <option key={value}>{value}</option>)}
 </select>
 </label>
 </div>

 <label className="space-y-1 text-sm font-medium text-slate-700">
 <span>Notes</span>
 <textarea
 rows={4}
 value={followUpForm.notes}
 onChange={(event) => setFollowUpForm((current) => ({ ...current, notes: event.target.value }))}
 placeholder="Add the purpose of the follow-up or the questions to resolve."
 className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
 />
 </label>

 <Button type="submit" loading={followUpLoading} icon={CalendarClock} className="w-full">
 Schedule follow-up
 </Button>
 </form>

 <div className="space-y-4 rounded-3xl border border-slate-200 p-4">
 <div>
 <h3 className="font-semibold text-slate-900">Follow-up timeline</h3>
 <p className="mt-1 text-sm text-slate-500">
 Scheduled and completed customer touchpoints.
 </p>
 </div>

 <div className="space-y-3">
 {(selectedCustomer.agent_workflow?.followUps || []).slice(0, 8).map((followUp) => (
 <div key={followUp._id} className="rounded-2xl bg-slate-50 px-4 py-3">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <p className="font-semibold text-slate-900">{followUp.type}</p>
 <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getFollowUpTone(followUp.status)}`}>
 {followUp.status}
 </span>
 </div>
 <p className="mt-1 text-sm text-slate-500">{formatDateTime(followUp.dueAt)}</p>
 {followUp.notes && <p className="mt-2 text-sm text-slate-600">{followUp.notes}</p>}
 </div>
 {followUp.status !== "Completed" && (
 <Button size="sm" variant="ghost" icon={CheckCircle2} onClick={() => handleCompleteFollowUp(followUp._id)}>
 Complete
 </Button>
 )}
 </div>
 </div>
 ))}

 {!selectedCustomer.agent_workflow?.followUps?.length && (
 <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
 No follow-ups recorded yet.
 </div>
 )}
 </div>
 </div>
 </div>

 <div className="grid gap-6 xl:grid-cols-2">
 <div className="rounded-3xl border border-slate-200 p-4">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h3 className="font-semibold text-slate-900">Recent claims</h3>
 <p className="mt-1 text-sm text-slate-500">Claim activity handled for this customer.</p>
 </div>
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 {selectedCustomerDetail?.claims?.length || 0}
 </span>
 </div>

 <div className="space-y-3">
 {(selectedCustomerDetail?.claims || []).slice(0, 4).map((claim) => (
 <div key={claim._id} className="rounded-2xl bg-slate-50 px-4 py-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold text-slate-900">{claim.policy?.name || "Policy claim"}</p>
 <p className="text-sm text-slate-500">{claim.reason}</p>
 </div>
 <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
 {claim.status}
 </span>
 </div>
 <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
 <span>{formatCurrency(claim.claimAmount)}</span>
 <span>{formatDate(claim.createdAt)}</span>
 </div>
 </div>
 ))}

 {!selectedCustomerDetail?.claims?.length && (
 <p className="text-sm text-slate-500">No claims handled for this customer yet.</p>
 )}
 </div>
 </div>

 <div className="rounded-3xl border border-slate-200 p-4">
 <div className="mb-4 flex items-center justify-between">
 <div>
 <h3 className="font-semibold text-slate-900">Commission and renewals</h3>
 <p className="mt-1 text-sm text-slate-500">Latest payment and renewal-linked records.</p>
 </div>
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 {(selectedCustomerDetail?.commissions?.length || 0) + (selectedCustomerDetail?.renewals?.length || 0)}
 </span>
 </div>

 <div className="space-y-3">
 {[...(selectedCustomerDetail?.commissions || []).slice(0, 3), ...(selectedCustomerDetail?.renewals || []).slice(0, 2)].map((record) => (
 <div key={record._id} className="rounded-2xl bg-slate-50 px-4 py-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold text-slate-900">{record.policy_id?.name || "Policy"}</p>
 <p className="text-sm text-slate-500">
 {record.renewal_status ? `Renewal: ${record.renewal_status}` : `Commission: ${record.commission_status}`}
 </p>
 </div>
 <div className="text-right">
 <p className="font-semibold text-slate-900">{formatCurrency(record.commission_amount || record.premium_amount)}</p>
 <p className="text-xs text-slate-500">{formatDate(record.createdAt)}</p>
 </div>
 </div>
 </div>
 ))}

 {!selectedCustomerDetail?.commissions?.length && !selectedCustomerDetail?.renewals?.length && (
 <p className="text-sm text-slate-500">No commission or renewal records are available yet.</p>
 )}
 </div>
 </div>
 </div>
 </div>
 )}
 </AgentPanelCard>
 </div>
 </section>

 <Modal
 open={isCreateModalOpen}
 onClose={() => setIsCreateModalOpen(false)}
 title="Add customer"
 description="Create a new customer directly in your assigned portfolio."
 size="lg"
 footer={
 <div className="flex justify-end gap-3">
 <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
 <Button type="submit" form="create-customer-form" loading={createCustomerLoading} icon={Plus}>
 Add customer
 </Button>
 </div>
 }
 >
 <form id="create-customer-form" onSubmit={handleCreateCustomer} className="grid gap-4 md:grid-cols-2">
 <Input
 label="Full name"
 value={customerForm.fullName}
 onChange={(event) => setCustomerForm((current) => ({ ...current, fullName: event.target.value }))}
 required
 />
 <Input
 label="Email"
 type="email"
 value={customerForm.email}
 onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))}
 required
 />
 <Input
 label="Temporary password"
 type="password"
 value={customerForm.password}
 onChange={(event) => setCustomerForm((current) => ({ ...current, password: event.target.value }))}
 required
 />
 <Input
 label="Mobile number"
 value={customerForm.mobileNumber}
 onChange={(event) => setCustomerForm((current) => ({ ...current, mobileNumber: event.target.value }))}
 required
 />
 <Input
 label="City"
 value={customerForm.city}
 onChange={(event) => setCustomerForm((current) => ({ ...current, city: event.target.value }))}
 />
 <Input
 label="State"
 value={customerForm.state}
 onChange={(event) => setCustomerForm((current) => ({ ...current, state: event.target.value }))}
 />
 <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
 <span>Risk profile</span>
 <select
 value={customerForm.risk_profile}
 onChange={(event) => setCustomerForm((current) => ({ ...current, risk_profile: event.target.value }))}
 className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
 >
 {["Low", "Medium", "High"].map((value) => <option key={value}>{value}</option>)}
 </select>
 </label>
 </form>
 </Modal>
 </div>
 );
}
