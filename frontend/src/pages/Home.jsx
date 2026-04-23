import { Link } from "react-router-dom";
import {
 Shield,
 Sparkles,
 Zap,
 CheckCircle2,
 TrendingUp,
 Users,
 FileCheck,
 Clock,
 ArrowRight,
 Star,
 ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import CountUp from "react-countup";
import {
 motion,
 useMotionValue,
 useReducedMotion,
 useSpring,
 useTransform,
} from "framer-motion";
import { CATEGORY_ICONS, CATEGORY_GRADIENTS } from "../utils/categoryConfig";

import heroPerson from "../assets/image/hero-person.png";
import aboutImg from "../assets/image/about-consultation.png";
import familyImg from "../assets/image/family-protection.png";

/* ─── useInView for scroll triggers ─────────────────── */
function useInView(threshold = 0.2) {
 const ref = useRef(null);
 const [inView, setInView] = useState(false);
 useEffect(() => {
 const el = ref.current;
 if (!el) return;
 const obs = new IntersectionObserver(
 ([entry]) => {
 if (entry.isIntersecting) setInView(true);
 },
 { threshold },
 );
 obs.observe(el);
 return () => obs.disconnect();
 }, [threshold]);
 return [ref, inView];
}

/* ═══════════════════════════════════════════════════════ */
export default function Home() {
 const [statsRef, statsInView] = useInView(0.3);
 const prefersReducedMotion = useReducedMotion();
 const heroRotateX = useMotionValue(0);
 const heroRotateY = useMotionValue(0);
 const heroRotateXSmooth = useSpring(heroRotateX, {
 stiffness: 160,
 damping: 22,
 mass: 0.7,
 });
 const heroRotateYSmooth = useSpring(heroRotateY, {
 stiffness: 160,
 damping: 22,
 mass: 0.7,
 });
 const heroOrbX = useTransform(heroRotateYSmooth, [-10, 10], [-12, 12]);
 const heroOrbY = useTransform(heroRotateXSmooth, [-10, 10], [12, -12]);

 const handleHeroMouseMove = (event) => {
 if (prefersReducedMotion) return;
 const bounds = event.currentTarget.getBoundingClientRect();
 const mouseX = event.clientX - bounds.left;
 const mouseY = event.clientY - bounds.top;
 const normalizedX = mouseX / bounds.width - 0.5;
 const normalizedY = mouseY / bounds.height - 0.5;
 heroRotateY.set(normalizedX * 12);
 heroRotateX.set(normalizedY * -10);
 };

 const handleHeroMouseLeave = () => {
 heroRotateX.set(0);
 heroRotateY.set(0);
 };

 const categories = [
 {
 name: "Car Insurance",
 slug: "car",
 icon: CATEGORY_ICONS.car,
 color: CATEGORY_GRADIENTS.car,
 desc: "Comprehensive vehicle coverage",
 },
 {
 name: "Bike Insurance",
 slug: "bike",
 icon: CATEGORY_ICONS.bike,
 color: CATEGORY_GRADIENTS.bike,
 desc: "Two-wheeler protection",
 },
 {
 name: "Health Insurance",
 slug: "health",
 icon: CATEGORY_ICONS.health,
 color: CATEGORY_GRADIENTS.health,
 desc: "Complete health coverage",
 },
 {
 name: "Life Insurance",
 slug: "life",
 icon: CATEGORY_ICONS.life,
 color: CATEGORY_GRADIENTS.life,
 desc: "Secure your family's future",
 },
 {
 name: "Travel Insurance",
 slug: "travel",
 icon: CATEGORY_ICONS.travel,
 color: CATEGORY_GRADIENTS.travel,
 desc: "Safe journeys worldwide",
 },
 {
 name: "Home Insurance",
 slug: "home",
 icon: CATEGORY_ICONS.home,
 color: CATEGORY_GRADIENTS.home,
 desc: "Protect your property",
 },
 ];

 const specializedCategories = [
 {
 name: "Commercial Motor",
 slug: "motor_commercial",
 icon: CATEGORY_ICONS.motor_commercial,
 color: CATEGORY_GRADIENTS.motor_commercial,
 desc: "Fleet, trucks, taxis & commercial vehicles",
 },
 {
 name: "Liability",
 slug: "liability",
 icon: CATEGORY_ICONS.liability,
 color: CATEGORY_GRADIENTS.liability,
 desc: "Public, professional & D&O liability",
 },
 {
 name: "Business",
 slug: "business",
 icon: CATEGORY_ICONS.business,
 color: CATEGORY_GRADIENTS.business,
 desc: "Marine, cyber & business interruption",
 },
 {
 name: "Agriculture",
 slug: "agriculture",
 icon: CATEGORY_ICONS.agriculture,
 color: CATEGORY_GRADIENTS.agriculture,
 desc: "Crop (PMFBY), livestock & weather",
 },
 {
 name: "Govt Schemes",
 slug: "micro_social",
 icon: CATEGORY_ICONS.micro_social,
 color: CATEGORY_GRADIENTS.micro_social,
 desc: "PMJJBY, PMSBY & microinsurance",
 },
 {
 name: "Specialty",
 slug: "specialty",
 icon: CATEGORY_ICONS.specialty,
 color: CATEGORY_GRADIENTS.specialty,
 desc: "Gadget, pet & event/wedding",
 },
 ];

 const [showMore, setShowMore] = useState(false);

 const stats = [
 { label: "Happy Customers", value: 15000, suffix: "+", icon: Users },
 { label: "Policies Sold", value: 8500, suffix: "+", icon: FileCheck },
 { label: "Claims Settled", value: 4200, suffix: "+", icon: CheckCircle2 },
 { label: "Support Available", value: 24, suffix: "/7", icon: Clock },
 ];

 const features = [
 {
 icon: Sparkles,
 title: "AI-Powered Recommendations",
 desc: "Our AI analyzes your profile to suggest the best policy tailored to your needs and budget.",
 color: "text-violet-500",
 bg: "bg-violet-50 ",
 },
 {
 icon: Zap,
 title: "Instant Quotes",
 desc: "Get accurate premium quotes in under 60 seconds with our smart comparison engine.",
 color: "text-amber-500",
 bg: "bg-amber-50 ",
 },
 {
 icon: CheckCircle2,
 title: "Easy Claims Process",
 desc: "Hassle-free digital claim submission with real-time tracking and quick settlements.",
 color: "text-emerald-500",
 bg: "bg-emerald-50 ",
 },
 {
 icon: TrendingUp,
 title: "Best Market Prices",
 desc: "Compare across 20+ insurers to find the most competitive premiums available.",
 color: "text-blue-500",
 bg: "bg-blue-50 ",
 },
 ];

 return (
 <div className="overflow-hidden">
 {/* ─── HERO ─────────────────────────────────────── */}
 <section className="relative min-h-[80vh] sm:min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 ">
 {/* decorative depth layers */}
 <motion.div
 animate={
 prefersReducedMotion
 ? undefined
 : { x: [0, 24, 0], y: [0, -18, 0], rotate: [0, 4, 0] }
 }
 transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -top-32 -left-32 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-indigo-300/20 blur-3xl "
 />
 <motion.div
 animate={
 prefersReducedMotion
 ? undefined
 : { x: [0, -20, 0], y: [0, 16, 0], rotate: [0, -3, 0] }
 }
 transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
 className="absolute -bottom-40 right-0 h-64 sm:h-[30rem] w-64 sm:w-[30rem] rounded-full bg-blue-300/20 blur-3xl "
 />

 <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-6 sm:gap-8 lg:gap-16 px-4 sm:px-6 py-12 sm:py-20 lg:grid-cols-2 lg:px-8">
 {/* text */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 >
 <span className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-semibold text-indigo-700 ">
 <Sparkles className="h-3 sm:h-3.5 w-3 sm:w-3.5" /> AI-Powered
 Platform
 </span>

 <h1 className="mt-3 sm:mt-4 text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 ">
 Life Insurance for{" "}
 <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent ">
 creating wealth
 </span>
 </h1>

 <p className="mt-4 sm:mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-slate-600 ">
 InsureAI uses advanced artificial intelligence to compare,
 recommend, and help you buy the perfect insurance policy — in
 under 60 seconds.
 </p>

 <div className="mt-8 flex flex-wrap items-center gap-4">
 <Link
 to="/policies"
 className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 hover:shadow-indigo-500/40"
 >
 Get Started
 <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
 </Link>
 <Link
 to="/premium-calculator"
 className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 "
 >
 Calculate Premium
 </Link>
 </div>

 {/* micro-trust badges */}
 <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 ">
 <span className="flex items-center gap-1.5">
 <CheckCircle2 className="h-4 w-4 text-emerald-500" /> IRDAI
 Compliant
 </span>
 <span className="flex items-center gap-1.5">
 <Star className="h-4 w-4 text-amber-500" /> 4.8★ Rated
 </span>
 <span className="flex items-center gap-1.5">
 <Shield className="h-4 w-4 text-blue-500" /> 100% Secure
 </span>
 </div>
 </motion.div>

 {/* hero image */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
 className="relative flex justify-center lg:justify-end scene-3d"
 onMouseMove={handleHeroMouseMove}
 onMouseLeave={handleHeroMouseLeave}
 style={
 prefersReducedMotion
 ? undefined
 : {
 rotateX: heroRotateXSmooth,
 rotateY: heroRotateYSmooth,
 transformPerspective: 1200,
 }
 }
 >
 <div className="relative card-3d">
 <motion.div
 style={prefersReducedMotion ? undefined : { x: heroOrbX, y: heroOrbY }}
 className="pointer-events-none absolute -top-8 -right-8 z-0 h-24 w-24 rounded-full bg-sky-300/30 blur-2xl"
 />
 <motion.div
 style={prefersReducedMotion ? undefined : { x: heroOrbY, y: heroOrbX }}
 className="pointer-events-none absolute -bottom-8 -left-8 z-0 h-24 w-24 rounded-full bg-indigo-400/25 blur-2xl"
 />
 <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-400/20 to-blue-300/20 blur-2xl " />
 <img
 src={heroPerson}
 alt="Insurance professional"
 className="relative z-10 h-auto w-full max-w-md rounded-3xl object-cover shadow-2xl lg:max-w-lg card-3d-layer"
 />
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
 className="absolute -bottom-4 -left-4 z-20 rounded-2xl border border-white/50 bg-white/70 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:-left-8 card-3d-layer"
 >
 <p className="text-xs font-medium text-slate-500 ">
 Policies Compared
 </p>
 <p className="text-2xl font-bold text-indigo-600 ">
 2,50,000+
 </p>
 </motion.div>

 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
 className="absolute -right-4 top-8 z-20 rounded-2xl border border-white/50 bg-white/70 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:-right-8 card-3d-layer"
 >
 <p className="text-xs font-medium text-slate-500 ">
 Avg. Savings
 </p>
 <p className="text-2xl font-bold text-emerald-600 ">
 ₹12,500
 </p>
 </motion.div>
 </div>
 </motion.div>
 </div>
 </section>

 {/* ─── INSURANCE CATEGORIES ─────────────────────── */}
 <section className="bg-white py-20 lg:py-28 relative">
 <div className="mx-auto max-w-7xl px-6 lg:px-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.6 }}
 className="text-center"
 >
 <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
 Explore Insurance Categories
 </h2>
 <p className="mx-auto mt-4 max-w-2xl text-slate-500 ">
 Find the perfect coverage for every aspect of your life. Compare
 plans across all major insurers.
 </p>
 </motion.div>

 <motion.div
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: "-50px" }}
 variants={{
 visible: { transition: { staggerChildren: 0.1 } },
 }}
 className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
 >
 {categories.map((cat) => (
 <motion.div
 key={cat.name}
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: "spring", stiffness: 300, damping: 24 },
 },
 }}
 whileHover={
 prefersReducedMotion
 ? undefined
 : { rotateX: 6, rotateY: -8, y: -10, z: 20 }
 }
 className="scene-3d"
 >
 <Link
 to={`/policies?category=${cat.slug}`}
 className="group relative flex items-center gap-5 rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm card-3d"
 >
 <div
 className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-md card-3d-layer`}
 >
 <cat.icon className="h-8 w-8 drop-shadow-sm" />
 </div>
 <div className="flex-1 card-3d-layer">
 <h3 className="font-semibold text-slate-900 ">
 {cat.name}
 </h3>
 <p className="mt-0.5 text-sm text-slate-500 ">
 {cat.desc}
 </p>
 </div>
 <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-indigo-500 card-3d-layer" />
 </Link>
 </motion.div>
 ))}

 {/* Specialized categories — shown when expanded */}
 {showMore &&
 specializedCategories.map((cat) => (
 <motion.div
 key={cat.name}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ type: "spring", stiffness: 300, damping: 24 }}
 whileHover={
 prefersReducedMotion
 ? undefined
 : { rotateX: 6, rotateY: -8, y: -10, z: 20 }
 }
 className="scene-3d"
 >
 <Link
 to={`/policies?category=${cat.slug}`}
 className="group relative flex items-center gap-5 rounded-2xl border border-slate-200/60 bg-white/50 p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm card-3d"
 >
 <div
 className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-md card-3d-layer`}
 >
 <cat.icon className="h-8 w-8 drop-shadow-sm" />
 </div>
 <div className="flex-1 card-3d-layer">
 <h3 className="font-semibold text-slate-900 ">
 {cat.name}
 </h3>
 <p className="mt-0.5 text-sm text-slate-500 ">
 {cat.desc}
 </p>
 </div>
 <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-indigo-500 card-3d-layer" />
 </Link>
 </motion.div>
 ))}
 </motion.div>

 {/* Show More / Less toggle */}
 <div className="mt-8 text-center">
 <button
 onClick={() => setShowMore((prev) => !prev)}
 className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-6 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 "
 >
 {showMore ? "Show Less" : "Show More Insurance Types"}
 <ChevronRight
 className={`h-4 w-4 transition-transform ${showMore ? "rotate-[-90deg]" : "rotate-90"}`}
 />
 </button>
 </div>
 </div>
 </section>

 {/* ─── ABOUT / HOW IT WORKS ─────────────────────── */}
 <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-28">
 <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl " />

 <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
 {/* image side */}
 <motion.div
 initial={{ opacity: 0, x: -30 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.8 }}
 className="relative"
 >
 <img
 src={aboutImg}
 alt="Insurance consultation"
 className="w-full rounded-3xl object-cover shadow-xl"
 />
 {/* overlay card */}
 <div className="absolute -bottom-6 -right-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:-right-8">
 <div className="flex items-center gap-3">
 <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 ">
 <CheckCircle2 className="h-5 w-5 text-emerald-600 " />
 </div>
 <div>
 <p className="text-sm font-semibold text-slate-900 ">
 Trusted by 15k+
 </p>
 <p className="text-xs text-slate-500 ">
 Happy Customers
 </p>
 </div>
 </div>
 </div>
 </motion.div>

 {/* text side */}
 <motion.div
 initial={{ opacity: 0, x: 30 }}
 whileInView={{ opacity: 1, x: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.8, delay: 0.2 }}
 >
 <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 ">
 About InsureAI
 </span>

 <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
 Change the way you think about insurance
 </h2>

 <p className="mt-5 text-slate-600 leading-relaxed ">
 InsureAI is India's first AI-powered insurance marketplace. We
 leverage advanced machine learning algorithms to analyze thousands
 of policies instantly, ensuring you get the best coverage at the
 most competitive price.
 </p>

 <ul className="mt-8 space-y-4">
 {[
 "Compare 500+ policies across 20+ insurers",
 "Get personalized AI recommendations in seconds",
 "Transparent pricing with no hidden charges",
 "Digital-first claim process — paperless & fast",
 ].map((item) => (
 <li
 key={item}
 className="flex items-start gap-3 text-sm text-slate-700 "
 >
 <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
 {item}
 </li>
 ))}
 </ul>

 <Link
 to="/policies"
 className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:gap-3 "
 >
 Explore All Policies <ArrowRight className="h-4 w-4" />
 </Link>
 </motion.div>
 </div>
 </section>

 {/* ─── STATS ─────────────────────────────────────── */}
 <section
 ref={statsRef}
 className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 py-16 lg:py-20"
 >
 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

 <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 text-center text-white sm:grid-cols-4 lg:px-8">
 {stats.map((stat) => (
 <div key={stat.label}>
 <stat.icon className="mx-auto mb-3 h-8 w-8 opacity-80" />
 <h3 className="text-3xl font-extrabold sm:text-4xl">
 {statsInView ? (
 <CountUp end={stat.value} duration={2.5} separator="," />
 ) : (
 0
 )}
 {stat.suffix}
 </h3>
 <p className="mt-1 text-sm font-medium text-blue-100">
 {stat.label}
 </p>
 </div>
 ))}
 </div>
 </section>

 {/* ─── WHY CHOOSE US ────────────────────────────── */}
 <section className="bg-white py-20 lg:py-28 relative overflow-hidden">
 <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-50px" }}
 transition={{ duration: 0.6 }}
 className="mx-auto max-w-2xl text-center"
 >
 <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
 Why Choose InsureAI?
 </h2>
 <p className="mt-4 text-slate-500 ">
 Experience the future of insurance with cutting-edge AI technology
 and unmatched customer service.
 </p>
 </motion.div>

 <motion.div
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: "-50px" }}
 variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
 className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
 >
 {features.map((feat) => (
 <motion.div
 key={feat.title}
 variants={{
 hidden: { opacity: 0, scale: 0.95, y: 15 },
 visible: {
 opacity: 1,
 scale: 1,
 y: 0,
 transition: { type: "spring", stiffness: 300, damping: 24 },
 },
 }}
 whileHover={
 prefersReducedMotion
 ? undefined
 : { rotateX: 7, rotateY: 7, y: -8, z: 22 }
 }
 className="group rounded-2xl border border-white/60 bg-white/70 p-7 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl transition hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 scene-3d card-3d "
 >
 <div
 className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${feat.bg} card-3d-layer`}
 >
 <feat.icon className={`h-6 w-6 ${feat.color}`} />
 </div>
 <h3 className="font-semibold text-slate-900 card-3d-layer">
 {feat.title}
 </h3>
 <p className="mt-2 text-sm leading-relaxed text-slate-500 card-3d-layer">
 {feat.desc}
 </p>
 </motion.div>
 ))}
 </motion.div>
 </div>
 </section>

 {/* ─── FAMILY CTA SECTION ───────────────────────── */}
 <section className="relative overflow-hidden bg-slate-50 ">
 <div className="mx-auto grid max-w-7xl grid-cols-1 items-center lg:grid-cols-2">
 {/* image */}
 <div className="relative h-64 overflow-hidden sm:h-80 lg:h-full lg:min-h-[28rem]">
 <img
 src={familyImg}
 alt="Happy family protected by insurance"
 className="h-full w-full object-cover"
 />
 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-50/80 lg:block hidden" />
 </div>

 {/* text */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.8 }}
 className="px-6 py-16 lg:px-16 lg:py-24"
 >
 <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
 Protect What Matters Most
 </h2>
 <p className="mt-5 text-slate-600 leading-relaxed ">
 Your family's safety and financial security are our top priority.
 With InsureAI, get comprehensive coverage plans that adapt to your
 life stage and budget.
 </p>
 <div className="mt-8 flex flex-wrap gap-4">
 <Link to="/policies" className="btn-primary">
 View All Plans <ArrowRight className="h-4 w-4" />
 </Link>
 <Link to="/premium-calculator" className="btn-ghost">
 Calculate Premium
 </Link>
 </div>
 </motion.div>
 </div>
 </section>

 {/* ─── FINAL CTA BANNER ─────────────────────────── */}
 <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 py-20 ">
 {/* decorative */}
 <div className="absolute -left-20 top-10 h-60 w-60 rounded-full bg-white/5 blur-2xl" />
 <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-white/5 blur-2xl" />

 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 whileInView={{ opacity: 1, scale: 1, y: 0 }}
 viewport={{ once: true, margin: "-100px" }}
 transition={{ duration: 0.6 }}
 className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white"
 >
 <Shield className="mx-auto mb-5 h-12 w-12 opacity-80" />
 <h2 className="text-3xl font-bold sm:text-4xl">
 Ready to secure your future?
 </h2>
 <p className="mx-auto mt-4 max-w-xl text-blue-100">
 Join 15,000+ customers who trust InsureAI for smarter, faster, and
 more affordable insurance decisions.
 </p>
 <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
 <Link
 to="/register"
 className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:bg-slate-50 active:scale-95"
 >
 Create Free Account <ArrowRight className="h-4 w-4" />
 </Link>
 <Link
 to="/policies"
 className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-md px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
 >
 Browse Policies
 </Link>
 </div>
 </motion.div>
 </section>
 </div>
 );
}
