import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
 Menu,
 Sparkles,
 X,
 LogOut,
 LayoutDashboard,
 UserCog,
 FileWarning,
 Search,
 ChevronDown,
 FileText,
 ArrowRightLeft,
 Calculator,
 RefreshCw,
 ShieldCheck,
 Phone,
 Shield,
 HeartPulse,
 Car,
 HomeIcon,
 Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";
import BrandMark from "./BrandMark";
import { getDashboardRouteForRole, normalizeRole } from "../utils/auth";

export default function Navbar() {
 const { isAuthenticated, user, logout } = useAuth();
 const [mobileOpen, setMobileOpen] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);
 const [searchOpen, setSearchOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const navigate = useNavigate();
 const profileRef = useRef(null);
 const searchRef = useRef(null);
 const dashboardRoute = getDashboardRouteForRole(user?.role);
 const isAdmin = normalizeRole(user?.role) === "ADMIN";
 const isUser = normalizeRole(user?.role) === "USER";

 /* close profile dropdown on outside click */
 useEffect(() => {
 const handleClick = (e) => {
 if (profileRef.current && !profileRef.current.contains(e.target)) {
 setProfileOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClick);
 return () => document.removeEventListener("mousedown", handleClick);
 }, []);

 /* close search on outside click */
 useEffect(() => {
 const handleClick = (e) => {
 if (searchRef.current && !searchRef.current.contains(e.target)) {
 setSearchOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClick);
 return () => document.removeEventListener("mousedown", handleClick);
 }, []);

 /* keyboard shortcuts */
 useEffect(() => {
 const handler = (e) => {
 if ((e.ctrlKey || e.metaKey) && e.key === "k") {
 e.preventDefault();
 setSearchOpen((p) => !p);
 }
 };
 document.addEventListener("keydown", handler);
 return () => document.removeEventListener("keydown", handler);
 }, []);

 /* user initials for avatar */
 const initials = user?.fullName
 ? user.fullName
 .split(" ")
 .map((n) => n[0])
 .join("")
 .toUpperCase()
 .slice(0, 2)
 : "U";

 const handleSearch = (e) => {
 e.preventDefault();
 if (searchQuery.trim()) {
 navigate(`/policies?search=${encodeURIComponent(searchQuery.trim())}`);
 setSearchOpen(false);
 setSearchQuery("");
 }
 };

 /* ─── Mega Menu Data ────────────────────────────────────── */
 const megaMenus = [
 {
 label: "Insurance Products",
 width: "w-[600px]",
 columns: [
 {
 title: "Explore",
 items: [
 {
 to: "/policies",
 label: "View All Policies",
 desc: "Browse our comprehensive catalogue",
 icon: FileText,
 },
 {
 to: "/compare-policies",
 label: "Compare Policies",
 desc: "Find the exact match for your needs",
 icon: ArrowRightLeft,
 },
 {
 to: "/premium-calculator",
 label: "Premium Calculator",
 desc: "A smart tool to estimate costs",
 icon: Calculator,
 },
 {
 to: "/recommendations",
 label: "AI Recommendations",
 desc: "Smart AI-driven policy picks",
 icon: Sparkles,
 },
 ],
 },
 {
 title: "Categories",
 items: [
 {
 to: "/policies?category=health",
 label: "Health Insurance",
 desc: "Protect your family's health",
 icon: HeartPulse,
 },
 {
 to: "/policies?category=life",
 label: "Life Insurance",
 desc: "Secure your family's future",
 icon: Shield,
 },
 {
 to: "/policies?category=car",
 label: "Motor Insurance",
 desc: "Coverage for your vehicles",
 icon: Car,
 },
 {
 to: "/policies?category=home",
 label: "Home",
 desc: "Protect your property",
 icon: HomeIcon,
 },
 ],
 },
 ],
 },
 {
 label: "Claims & Support",
 width: "w-[480px]",
 columns: [
 {
 title: "Claims",
 items: [
 {
 to: "/claims",
 label: "File a Claim",
 desc: "Submit a new insurance claim easily",
 icon: FileWarning,
 },
 {
 to: "/claims",
 label: "Track Claim Status",
 desc: "Check the status of your existing claims",
 icon: FileText,
 },
 {
 to: "/renewals",
 label: "Renew Policy",
 desc: "Renew expiring motor and health coverage",
 icon: RefreshCw,
 },
 ],
 },
 {
 title: "Support",
 items: [
 {
 to: "/contact",
 label: "Contact Us",
 desc: "Get in touch with our support team",
 icon: Phone,
 },
 {
 to: "/",
 label: "Resource Center",
 desc: "Guides, tutorials, and FAQs",
 icon: Briefcase,
 },
 ],
 },
 ],
 },
 ];

 return (
 <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-md transition-all ">
 {/* Top accent gradient line */}
 <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

 <div className="mx-auto flex h-14 sm:h-16 max-w-[1400px] items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 gap-2 sm:gap-4">
 {/* ─── Left Section: Logo & Nav ───── */}
 <div className="flex items-center gap-3 sm:gap-6 lg:gap-10 min-w-0">
 {/* Logo */}
 <Link
 to="/"
 className="group flex items-center gap-1.5 sm:gap-2.5 text-primary-700 shrink-0"
 >
 <div className="relative">
 <span className="absolute inset-0 rounded-full bg-primary-400/20 blur-md transition-all group-hover:bg-primary-400/30" />
 <BrandMark className="relative h-6 sm:h-8 w-6 sm:w-8 text-primary-600 " />
 </div>
 <span className="hidden sm:inline font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 ">
 InsureAI
 </span>
 </Link>

 {/* Desktop Nav */}
 <nav className="hidden items-center gap-1 md:flex">
 {megaMenus.map((menu) => (
 <div key={menu.label} className="group relative">
 <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary-600 ">
 {menu.label}
 <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:-rotate-180" />
 </button>

 {/* Dropdown Popover */}
 <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
 <div
 className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl ${menu.width}`}
 >
 <div className="grid grid-cols-2 p-3">
 {menu.columns.map((col, idx) => (
 <div key={idx} className="p-3">
 <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 ">
 {col.title}
 </h3>
 <ul className="space-y-1">
 {col.items.map((item) => (
 <li key={item.label}>
 <Link
 to={item.to}
 className="group/item flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 "
 >
 <div className="flex shrink-0 items-center justify-center rounded-lg bg-primary-50 p-2 text-primary-600 ">
 <item.icon className="h-5 w-5 transition-transform group-hover/item:scale-110" />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900 ">
 {item.label}
 </p>
 <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
 {item.desc}
 </p>
 </div>
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 ))}

 <NavLink
 to={dashboardRoute}
 className={({ isActive }) =>
 `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
 isActive
 ? "bg-primary-50 text-primary-700 "
 : "text-slate-600 hover:bg-slate-50 hover:text-primary-600 "
 }`
 }
 >
 Dashboard
 </NavLink>
 {isAdmin && (
 <NavLink
 to="/admin"
 className={({ isActive }) =>
 `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
 isActive
 ? "bg-primary-50 text-primary-700 "
 : "text-slate-600 hover:bg-slate-50 hover:text-primary-600 "
 }`
 }
 >
 Admin Area
 </NavLink>
 )}
 </nav>
 </div>

 {/* ─── Right Section: Actions ───── */}
 <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
 {/* Global Search */}
 <div ref={searchRef} className="relative hidden md:block">
 <button
 onClick={() => setSearchOpen((prev) => !prev)}
 className="flex items-center justify-between gap-3 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1.5 text-sm text-slate-500 transition-all hover:bg-slate-100 hover:ring-2 hover:ring-primary-100 w-40 lg:w-56"
 >
 <div className="flex items-center gap-2">
 <Search className="h-4 w-4 shrink-0" />
 <span className="hidden lg:inline">Search policies...</span>
 <span className="inline lg:hidden text-xs">Search...</span>
 </div>
 <kbd className="hidden rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-400 shadow-sm lg:block">
 ⌘K
 </kbd>
 </button>

 <AnimatePresence>
 {searchOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -4 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl "
 >
 <form onSubmit={handleSearch} className="p-2">
 <div className="relative flex items-center">
 <Search className="absolute left-3 h-4 w-4 text-slate-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="What are you looking for?"
 className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:ring-0 "
 autoFocus
 />
 </div>
 </form>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 <div className="h-5 sm:h-6 w-px bg-slate-200 hidden md:block mx-1" />

 {/* Notifications */}
 {isAuthenticated && <NotificationBell />}

 {/* User Auth / Profile */}
 {isAuthenticated ? (
 <div className="relative ml-1" ref={profileRef}>
 <button
 onClick={() => setProfileOpen((prev) => !prev)}
 className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition-all hover:bg-slate-50 hover:shadow-sm "
 >
 <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white shadow-inner">
 {initials}
 </div>
 <span className="hidden text-sm font-medium text-slate-700 sm:block">
 My Account
 </span>
 <ChevronDown className="h-4 w-4 text-slate-400 sm:block hidden" />
 </button>

 <AnimatePresence>
 {profileOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -4 }}
 transition={{ duration: 0.15 }}
 className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl backdrop-blur-xl "
 >
 <div className="border-b border-slate-100 px-4 py-3 ">
 <p className="truncate text-sm font-semibold text-slate-900 ">
 {user?.fullName || "Welcome back!"}
 </p>
 <p className="truncate text-xs text-slate-500">
 {user?.email}
 </p>
 <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600 ">
 {normalizeRole(user?.role)}
 </p>
 </div>
 <div className="p-1.5 flex flex-col gap-0.5">
 <Link
 to={dashboardRoute}
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 "
 >
 <LayoutDashboard className="h-4 w-4" /> Dashboard
 </Link>
 {isUser && (
 <>
 <Link
 to="/profile"
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 "
 >
 <UserCog className="h-4 w-4" /> Profile Settings
 </Link>
 <Link
 to="/my-policies"
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 "
 >
 <ShieldCheck className="h-4 w-4" /> My Policies
 </Link>
 <Link
 to="/renewals"
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 "
 >
 <RefreshCw className="h-4 w-4" /> Renewals
 </Link>
 <Link
 to="/claims"
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 "
 >
 <FileWarning className="h-4 w-4" /> My Claims
 </Link>
 </>
 )}
 {isAdmin && (
 <Link
 to="/admin"
 onClick={() => setProfileOpen(false)}
 className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 "
 >
 <Shield className="h-4 w-4" /> Admin Area
 </Link>
 )}
 <div className="my-1 h-px bg-slate-100 " />
 <button
 onClick={() => {
 setProfileOpen(false);
 logout();
 }}
 className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 "
 >
 <LogOut className="h-4 w-4" /> Sign Out
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ) : (
 <div className="ml-1 items-center gap-2 sm:flex hidden">
 <Link
 to="/login"
 className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600 px-2 py-1.5 rounded-lg hover:bg-slate-50 "
 >
 Sign In
 </Link>
 <Link
 to="/register"
 className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md "
 >
 Register
 </Link>
 </div>
 )}

 {/* Mobile Menu Toggle */}
 <button
 onClick={() => setMobileOpen(!mobileOpen)}
 className="ml-1 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden"
 >
 {mobileOpen ? (
 <X className="h-5 w-5" />
 ) : (
 <Menu className="h-5 w-5" />
 )}
 </button>
 </div>
 </div>

 {/* ─── Mobile Menu (Accordion style) ───── */}
 <AnimatePresence>
 {mobileOpen && (
 <motion.nav
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.2 }}
 className="border-t border-slate-200/80 bg-white px-4 py-4 md:hidden "
 >
 {!isAuthenticated && (
 <div className="mb-4 flex gap-2 sm:hidden">
 <Link
 to="/login"
 onClick={() => setMobileOpen(false)}
 className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-sm font-semibold text-slate-700 "
 >
 Sign In
 </Link>
 <Link
 to="/register"
 onClick={() => setMobileOpen(false)}
 className="flex-1 rounded-xl bg-primary-600 py-2 text-center text-sm font-semibold text-white "
 >
 Register
 </Link>
 </div>
 )}

 <div className="space-y-4">
 {megaMenus.map((menu) => (
 <div key={menu.label} className="space-y-2">
 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 ">
 {menu.label}
 </h4>
 <div className="grid grid-cols-1 gap-1">
 {menu.columns.map((col) =>
 col.items.map((item) => (
 <Link
 key={item.label}
 to={item.to}
 onClick={() => setMobileOpen(false)}
 className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 "
 >
 <item.icon className="h-4 w-4 text-primary-500" />
 {item.label}
 </Link>
 )),
 )}
 </div>
 </div>
 ))}

 <div className="space-y-2">
 <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 ">
 More
 </h4>
 <div className="grid grid-cols-1 gap-1">
 <Link
 to={dashboardRoute}
 onClick={() => setMobileOpen(false)}
 className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 "
 >
 <LayoutDashboard className="h-4 w-4 text-primary-500" />
 Dashboard
 </Link>
 {isAdmin && (
 <Link
 to="/admin"
 onClick={() => setMobileOpen(false)}
 className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 "
 >
 <Shield className="h-4 w-4 text-primary-500" />
 Admin Area
 </Link>
 )}
 </div>
 </div>
 </div>
 </motion.nav>
 )}
 </AnimatePresence>
 </header>
 );
}
