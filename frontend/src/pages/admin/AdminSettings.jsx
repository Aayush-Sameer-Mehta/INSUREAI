import { useState } from "react";
import {
 Settings, Bell, Brain, Save, Server, Info,
 Globe, Shield, Database,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } } };

function ToggleSwitch({ id, label, description, checked, onChange }) {
 return (
 <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50 ">
 <div>
 <label htmlFor={id} className="cursor-pointer text-sm font-medium text-slate-900 ">{label}</label>
 {description && <p className="mt-0.5 text-xs text-slate-500 ">{description}</p>}
 </div>
 <button
 type="button"
 id={id}
 role="switch"
 aria-checked={checked}
 onClick={() => onChange(!checked)}
 className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
 checked ? "bg-primary-600" : "bg-slate-300 "
 }`}
 >
 <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${checked ? "translate-x-5.5" : "translate-x-0.5"}`} />
 </button>
 </div>
 );
}

export default function AdminSettings() {
 const [settings, setSettings] = useState({
 appName: "InsureAI",
 supportEmail: "support@insureai.com",
 enableNotifications: true,
 enableEmailAlerts: true,
 enableSmsAlerts: false,
 aiEnabled: true,
 fraudDetection: true,
 autoRecommendations: true,
 aiConfidenceThreshold: 70,
 });

 const [saving, setSaving] = useState(false);

 const handleChange = (key, value) => {
 setSettings((prev) => ({ ...prev, [key]: value }));
 };

 const handleSave = () => {
 setSaving(true);
 setTimeout(() => {
 setSaving(false);
 toast.success("Settings saved successfully!");
 }, 800);
 };

 return (
 <motion.div initial="visible" animate="visible" variants={containerVariants} className="space-y-8">
 <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="section-title flex items-center gap-2">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-inner">
 <Settings className="h-5 w-5 text-white" />
 </div>
 Settings
 </h1>
 <p className="section-subtitle mt-1">Manage application preferences</p>
 </div>
 <button onClick={handleSave} disabled={saving} className="btn-primary">
 <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
 </button>
 </motion.div>

 <motion.div variants={itemVariants} className="panel p-6">
 <div className="mb-5 flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 ">
 <Globe className="h-4 w-4 text-primary-500" />
 </div>
 <h2 className="text-base font-bold text-slate-900 ">General</h2>
 </div>
 <div className="space-y-4">
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Application Name</label>
 <input type="text" value={settings.appName} onChange={(e) => handleChange("appName", e.target.value)} className="field max-w-sm" />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Support Email</label>
 <input type="email" value={settings.supportEmail} onChange={(e) => handleChange("supportEmail", e.target.value)} className="field max-w-sm" />
 </div>
 </div>
 </motion.div>

 <motion.div variants={itemVariants} className="panel p-6">
 <div className="mb-5 flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 ">
 <Bell className="h-4 w-4 text-amber-500" />
 </div>
 <h2 className="text-base font-bold text-slate-900 ">Notifications</h2>
 </div>
 <div className="space-y-3">
 <ToggleSwitch id="enableNotifications" label="Push Notifications" description="Enable in-app push notifications for users" checked={settings.enableNotifications} onChange={(v) => handleChange("enableNotifications", v)} />
 <ToggleSwitch id="enableEmailAlerts" label="Email Alerts" description="Send email alerts for important events" checked={settings.enableEmailAlerts} onChange={(v) => handleChange("enableEmailAlerts", v)} />
 <ToggleSwitch id="enableSmsAlerts" label="SMS Alerts" description="Send SMS for payment confirmations and claim updates" checked={settings.enableSmsAlerts} onChange={(v) => handleChange("enableSmsAlerts", v)} />
 </div>
 </motion.div>

 <motion.div variants={itemVariants} className="panel p-6">
 <div className="mb-5 flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 ">
 <Brain className="h-4 w-4 text-violet-500" />
 </div>
 <h2 className="text-base font-bold text-slate-900 ">AI Configuration</h2>
 </div>
 <div className="space-y-3">
 <ToggleSwitch id="aiEnabled" label="AI Engine" description="Enable AI-powered features across the platform" checked={settings.aiEnabled} onChange={(v) => handleChange("aiEnabled", v)} />
 <ToggleSwitch id="fraudDetection" label="Fraud Detection" description="AI-based fraud risk scoring on claim submissions" checked={settings.fraudDetection} onChange={(v) => handleChange("fraudDetection", v)} />
 <ToggleSwitch id="autoRecommendations" label="Auto Recommendations" description="AI-generated policy recommendations for users" checked={settings.autoRecommendations} onChange={(v) => handleChange("autoRecommendations", v)} />
 <div className="rounded-xl border border-slate-100 p-4 ">
 <label className="mb-1.5 block text-sm font-medium text-slate-900 ">
 AI Confidence Threshold
 <span className="ml-2 text-xs font-normal text-slate-500">({settings.aiConfidenceThreshold}%)</span>
 </label>
 <p className="mb-3 text-xs text-slate-500 ">Minimum confidence score for AI auto-approval suggestions</p>
 <input type="range" min="30" max="95" value={settings.aiConfidenceThreshold} onChange={(e) => handleChange("aiConfidenceThreshold", Number(e.target.value))} className="w-full accent-violet-600" />
 <div className="flex justify-between text-[10px] text-slate-400"><span>30%</span><span>95%</span></div>
 </div>
 </div>
 </motion.div>

 <motion.div variants={itemVariants} className="panel p-6">
 <div className="mb-5 flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 ">
 <Server className="h-4 w-4 text-slate-500" />
 </div>
 <h2 className="text-base font-bold text-slate-900 ">System Info</h2>
 </div>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {[
 { icon: Info, label: "Version", value: "2.0.0", color: "text-primary-500" },
 { icon: Database, label: "Database", value: "MongoDB", color: "text-emerald-500" },
 { icon: Shield, label: "Auth", value: "JWT + Refresh", color: "text-amber-500" },
 { icon: Brain, label: "AI Engine", value: "Active", color: "text-violet-500" },
 ].map((item) => (
 <div key={item.label} className="rounded-xl border border-slate-100 p-3 ">
 <div className="flex items-center gap-1.5 text-xs text-slate-500"><item.icon className={`h-3 w-3 ${item.color}`} />{item.label}</div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">{item.value}</p>
 </div>
 ))}
 </div>
 </motion.div>
 </motion.div>
 );
}
