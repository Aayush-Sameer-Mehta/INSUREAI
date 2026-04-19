import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, ShieldCheck, CreditCard, AlertTriangle, Sparkles, X, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchNotifications, markNotificationRead } from "../services/notificationService";

/* ─── Generate smart notifications based on user profile ─ */
function generateNotifications(user) {
 if (!user) return [];
 const notifs = [];
 const now = new Date();

 /* Welcome notification */
 notifs.push({
 id: "welcome",
 icon: Sparkles,
 color: "text-indigo-500",
 bg: "bg-indigo-50 ",
 title: "Welcome to InsureAI!",
 message: "Explore AI-powered recommendations to find your perfect policy.",
 time: "Just now",
 });

 /* Profile completion check */
 const profileFields = [user.dateOfBirth, user.mobileNumber, user.occupation, user.city, user.annualIncome];
 const filled = profileFields.filter(Boolean).length;
 if (filled < profileFields.length) {
 notifs.push({
 id: "profile-incomplete",
 icon: AlertTriangle,
 color: "text-amber-500",
 bg: "bg-amber-50 ",
 title: "Complete Your Profile",
 message: `Your profile is ${Math.round((filled / profileFields.length) * 100)}% complete. Fill in details for better recommendations.`,
 time: "Action needed",
 });
 }

 /* Policy purchase notifications */
 const purchases = user.purchasedPolicies || [];
 if (purchases.length > 0) {
 const latest = purchases[purchases.length - 1];
 const purchaseDate = new Date(latest.purchasedAt);
 const daysAgo = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
 notifs.push({
 id: "latest-purchase",
 icon: CreditCard,
 color: "text-emerald-500",
 bg: "bg-emerald-50 ",
 title: "Policy Purchased",
 message: `Your latest policy "${latest.policy?.name || "Policy"}" is active.`,
 time: daysAgo === 0 ? "Today" : `${daysAgo}d ago`,
 });
 }

 /* Coverage gap alert */
 const ownedCategories = new Set(purchases.map((p) => p.policy?.category).filter(Boolean));
 const important = ["health", "life"];
 const missingImportant = important.filter((c) => !ownedCategories.has(c));
 if (missingImportant.length > 0) {
 notifs.push({
 id: "coverage-gap",
 icon: ShieldCheck,
 color: "text-rose-500",
 bg: "bg-rose-50 ",
 title: "Coverage Gap Detected",
 message: `You don't have ${missingImportant.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(" or ")} insurance yet.`,
 time: "Important",
 });
 }

 return notifs;
}

/* ═══════════════════════════════════════════════════════ */
export default function NotificationBell() {
 const { user } = useAuth();
 const [open, setOpen] = useState(false);
 const [serverNotifs, setServerNotifs] = useState([]);
 const [dismissed, setDismissed] = useState(() => {
 try {
 return JSON.parse(localStorage.getItem("insureai_dismissed") || "[]");
 } catch {
 return [];
 }
 });
 const panelRef = useRef(null);

 /* Close on outside click */
 useEffect(() => {
 const handler = (e) => {
 if (panelRef.current && !panelRef.current.contains(e.target)) {
 setOpen(false);
 }
 };
 document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, []);

 useEffect(() => {
 if (!user) return;
 fetchNotifications()
 .then((items) => setServerNotifs(Array.isArray(items) ? items : []))
 .catch(() => setServerNotifs([]));
 }, [user]);

 const fallbackNotifs = useMemo(() => generateNotifications(user), [user]);
 const allNotifs = useMemo(() => {
 const mappedServer = (serverNotifs || []).map((n) => ({
 id: n._id,
 icon: n.type === "claim" ? AlertTriangle : n.type === "purchase" ? CreditCard : Sparkles,
 color: n.type === "claim" ? "text-amber-500" : n.type === "purchase" ? "text-emerald-500" : "text-indigo-500",
 bg: n.type === "claim" ? "bg-amber-50 " : n.type === "purchase" ? "bg-emerald-50 " : "bg-indigo-50 ",
 title: n.title,
 message: n.message,
 time: new Date(n.createdAt).toLocaleDateString(),
 readAt: n.readAt,
 source: "server",
 }));
 return mappedServer.length ? mappedServer : fallbackNotifs;
 }, [serverNotifs, fallbackNotifs]);

 const notifications = allNotifs.filter((n) => !n.readAt && !dismissed.includes(n.id));
 const unreadCount = notifications.length;

 const dismiss = (id) => {
 const updated = [...dismissed, id];
 setDismissed(updated);
 localStorage.setItem("insureai_dismissed", JSON.stringify(updated));
 markNotificationRead(id).catch(() => {});
 };

 const dismissAll = () => {
 const updated = allNotifs.map((n) => n.id);
 setDismissed(updated);
 localStorage.setItem("insureai_dismissed", JSON.stringify(updated));
 allNotifs.forEach((n) => markNotificationRead(n.id).catch(() => {}));
 };

 return (
 <div className="relative" ref={panelRef}>
 {/* Bell button */}
 <button
 type="button"
 onClick={() => setOpen((p) => !p)}
 className="btn-ghost !px-2.5 !py-2 relative transition-transform hover:scale-105 active:scale-95"
 >
 <Bell className="h-4 w-4" />
 {unreadCount > 0 && (
 <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
 {unreadCount}
 </span>
 )}
 </button>

 {/* Dropdown panel */}
 {open && (
 <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 ">
 <div className="flex items-center gap-2">
 <Bell className="h-4 w-4 text-indigo-500" />
 <span className="text-sm font-semibold text-slate-900 ">Notifications</span>
 {unreadCount > 0 && (
 <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 ">
 {unreadCount}
 </span>
 )}
 </div>
 {unreadCount > 0 && (
 <button
 type="button"
 onClick={dismissAll}
 className="flex items-center gap-1 text-[11px] font-medium text-slate-500 transition hover:text-indigo-600"
 >
 <Check className="h-3 w-3" /> Mark all read
 </button>
 )}
 </div>

 {/* Notification list */}
 <div className="max-h-72 overflow-y-auto">
 {notifications.length === 0 ? (
 <div className="py-8 text-center">
 <Bell className="mx-auto mb-2 h-6 w-6 text-slate-300 " />
 <p className="text-sm text-slate-500">All caught up!</p>
 </div>
 ) : (
 <div className="p-2 space-y-1">
 {notifications.map((notif) => {
 const Icon = notif.icon;
 return (
 <div
 key={notif.id}
 className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50 "
 >
 <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notif.bg}`}>
 <Icon className={`h-4 w-4 ${notif.color}`} />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-slate-900 ">{notif.title}</p>
 <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
 <span className="mt-1 inline-block text-[10px] text-slate-400">{notif.time}</span>
 </div>
 <button
 type="button"
 onClick={() => dismiss(notif.id)}
 className="mt-0.5 shrink-0 rounded p-1 text-slate-300 opacity-0 transition hover:text-slate-500 group-hover:opacity-100 "
 >
 <X className="h-3 w-3" />
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
}
