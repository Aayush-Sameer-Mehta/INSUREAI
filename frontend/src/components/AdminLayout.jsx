import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
 LayoutDashboard,
 Users,
 Shield,
 FileWarning,
 CreditCard,
 ChevronLeft,
 Menu,
 X,
 BarChart3,
 Settings,
 Sparkles,
 Zap,
 FileBarChart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const NAV_SECTIONS = [
 {
 title: "Main",
 items: [
 { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
 ],
 },
 {
 title: "Management",
 items: [
 { to: "/admin/users", icon: Users, label: "Users" },
 { to: "/admin/policies", icon: Shield, label: "Policies" },
 { to: "/admin/claims", icon: FileWarning, label: "Claims" },
 { to: "/admin/payments", icon: CreditCard, label: "Payments" },
 ],
 },
 {
 title: "Intelligence",
 items: [
 { to: "/admin/reports", icon: FileBarChart, label: "Reports" },
 { to: "/admin/settings", icon: Settings, label: "Settings" },
 ],
 },
];

const sidebarVariants = {
 expanded: {
 width: 272,
 transition: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
 },
 collapsed: {
 width: 76,
 transition: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
 },
};

const labelVariants = {
 show: {
 opacity: 1,
 x: 0,
 filter: "blur(0px)",
 transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
 },
 hide: {
 opacity: 0,
 x: -12,
 filter: "blur(4px)",
 transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
 },
};

const sectionTitleVariants = {
 show: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1], delay: 0.1 },
 },
 hide: {
 opacity: 0,
 y: -4,
 transition: { duration: 0.1 },
 },
};

const footerVariants = {
 show: {
 opacity: 1,
 y: 0,
 scale: 1,
 transition: { type: "spring", stiffness: 300, damping: 25, delay: 0.15 },
 },
 hide: {
 opacity: 0,
 y: 8,
 scale: 0.95,
 transition: { duration: 0.15, ease: "easeIn" },
 },
};

const mobileDrawerVariants = {
 hidden: {
 x: "-100%",
 transition: { type: "spring", stiffness: 400, damping: 40 },
 },
 visible: {
 x: 0,
 transition: { type: "spring", stiffness: 400, damping: 40 },
 },
};

function SidebarNavItem({ item, collapsed, onNavigate }) {
 const prefersReducedMotion = useReducedMotion();

 return (
 <NavLink
 to={item.to}
 end={item.end}
 onClick={onNavigate}
 className={({ isActive }) =>
 `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
 isActive
 ? "bg-primary-50/80 text-primary-700 shadow-sm shadow-primary-500/5 "
 : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-900 "
 } ${collapsed ? "justify-center" : ""}`
 }
 >
 {({ isActive }) => (
 <>
 {isActive && (
 <motion.div
 layoutId="admin-sidebar-pill"
 className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary-500 to-primary-600 shadow-sm shadow-primary-500/30 "
 transition={
 prefersReducedMotion
 ? { duration: 0 }
 : { type: "spring", stiffness: 350, damping: 30, mass: 0.8 }
 }
 />
 )}
 <motion.div
 whileHover={prefersReducedMotion ? {} : { scale: 1.12, rotate: 3 }}
 whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
 transition={{ type: "spring", stiffness: 500, damping: 20 }}
 >
 <item.icon
 className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
 isActive ? "" : "group-hover:text-primary-500"
 }`}
 />
 </motion.div>
 <AnimatePresence mode="wait">
 {!collapsed && (
 <motion.span
 key="label"
 variants={labelVariants}
 initial="hide"
 animate="show"
 exit="hide"
 className="truncate"
 >
 {item.label}
 </motion.span>
 )}
 </AnimatePresence>
 {item.badge && !collapsed && (
 <motion.span
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-red-500/30"
 >
 {item.badge}
 </motion.span>
 )}
 {collapsed && (
 <div className="pointer-events-none absolute left-full ml-3 hidden rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block ">
 {item.label}
 {item.badge && (
 <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold">
 {item.badge}
 </span>
 )}
 <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900 " />
 </div>
 )}
 </>
 )}
 </NavLink>
 );
}

function SidebarContent({ collapsed, onNavigate }) {
 return (
 <>
 <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
 {NAV_SECTIONS.map((section) => {
 return (
 <div key={section.title} className="mb-4">
 <AnimatePresence mode="wait">
 {!collapsed && (
 <motion.p
 key={section.title}
 variants={sectionTitleVariants}
 initial="hide"
 animate="show"
 exit="hide"
 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 "
 >
 {section.title}
 </motion.p>
 )}
 </AnimatePresence>
 <div className="space-y-1">
 {section.items.map((item) => (
 <SidebarNavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
 ))}
 </div>
 </div>
 );
 })}
 </nav>

 <AnimatePresence>
 {!collapsed && (
 <motion.div
 variants={footerVariants}
 initial="hide"
 animate="show"
 exit="hide"
 className="border-t border-slate-100/80 p-4 "
 >
 <motion.div
 className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 via-secondary-50/50 to-accent-50/30 p-3.5 "
 whileHover={{ scale: 1.02 }}
 transition={{ type: "spring", stiffness: 300 }}
 >
 <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary-400/10 blur-xl" />
 <div className="relative">
 <div className="flex items-center gap-2">
 <motion.div
 className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 shadow-sm"
 animate={{ rotate: [0, 5, -5, 0] }}
 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
 >
 <Zap className="h-3 w-3 text-white" />
 </motion.div>
 <span className="text-xs font-bold text-primary-700 ">
 AI Insights
 </span>
 </div>
 <p className="mt-2 text-[11px] leading-relaxed text-slate-600 ">
 Smart analytics and fraud detection active.
 <span className="ml-1 font-medium text-primary-600 ">
 View Reports →
 </span>
 </p>
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 );
}

export default function AdminLayout() {
 const [collapsed, setCollapsed] = useState(false);
 const [mobileOpenPath, setMobileOpenPath] = useState(null);
 const location = useLocation();
 const mobileOpen = mobileOpenPath === location.pathname;

 useEffect(() => {
 if (mobileOpen) {
 document.body.style.overflow = "hidden";
 } else {
 document.body.style.overflow = "";
 }
 return () => {
 document.body.style.overflow = "";
 };
 }, [mobileOpen]);

 return (
 <div className="admin-theme flex h-[calc(100vh-64px)] overflow-hidden">
 <div className="fixed left-0 right-0 top-16 z-40 flex items-center gap-3 border-b border-slate-200/60 bg-white/95 px-4 py-2.5 backdrop-blur-xl lg:hidden ">
 <button
 type="button"
 onClick={() => setMobileOpenPath(location.pathname)}
 className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 "
 aria-label="Open navigation"
 >
 <Menu className="h-5 w-5" />
 </button>
 <div className="flex items-center gap-2">
 <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 shadow-sm">
 <Sparkles className="h-3.5 w-3.5 text-white" />
 </div>
 <span className="text-sm font-bold tracking-wide text-primary-600 ">
 Admin Panel
 </span>
 </div>
 </div>

 <AnimatePresence>
 {mobileOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="drawer-backdrop lg:hidden"
 onClick={() => setMobileOpenPath(null)}
 />
 <motion.aside
 variants={mobileDrawerVariants}
 initial="hidden"
 animate="visible"
 exit="hidden"
 className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-slate-200/60 bg-white shadow-2xl lg:hidden "
 >
 <div className="h-[2px] w-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />
 <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-4 ">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-600/25">
 <Sparkles className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <span className="text-sm font-bold tracking-wide text-primary-600 ">
 InsureAI
 </span>
 <p className="text-[10px] font-medium text-slate-400 ">
 Admin Panel
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setMobileOpenPath(null)}
 className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 "
 aria-label="Close navigation"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 <SidebarContent
 collapsed={false}
 onNavigate={() => setMobileOpenPath(null)}
 />
 </motion.aside>
 </>
 )}
 </AnimatePresence>

 <motion.aside
 initial={false}
 animate={collapsed ? "collapsed" : "expanded"}
 variants={sidebarVariants}
 className="sticky top-0 z-30 hidden h-full flex-col border-r border-slate-200/60 bg-white/90 backdrop-blur-xl lg:flex overflow-hidden"
 >
 <motion.div
 className="h-[2px] w-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500"
 initial={{ scaleX: 0 }}
 animate={{ scaleX: 1 }}
 transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
 style={{ transformOrigin: "left" }}
 />
 <div className="flex items-center justify-between border-b border-slate-100/80 px-4 py-4 ">
 <AnimatePresence mode="wait">
 {!collapsed && (
 <motion.div
 key="brand"
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.8 }}
 transition={{ type: "spring", stiffness: 400, damping: 25 }}
 className="flex items-center gap-2.5"
 >
 <motion.div
 className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-600/25"
 whileHover={{ rotate: 12, scale: 1.05 }}
 transition={{ type: "spring", stiffness: 400 }}
 >
 <Sparkles className="h-4.5 w-4.5 text-white" />
 </motion.div>
 <div>
 <span className="text-sm font-bold tracking-wide text-primary-600 ">
 InsureAI
 </span>
 <p className="text-[10px] font-medium text-slate-400 ">
 Admin Panel
 </p>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 <motion.button
 onClick={() => setCollapsed((c) => !c)}
 className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 "
 aria-label="Toggle sidebar"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.9 }}
 >
 <motion.div
 animate={{ rotate: collapsed ? 180 : 0 }}
 transition={{ type: "spring", stiffness: 300, damping: 20 }}
 >
 {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
 </motion.div>
 </motion.button>
 </div>
 <SidebarContent
 collapsed={collapsed}
 onNavigate={undefined}
 />
 </motion.aside>

 <motion.div
 className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 pb-16"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 >
 <div className="h-[52px] lg:hidden" />
 <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
 <Outlet />
 </div>
 </motion.div>
 </div>
 );
}
