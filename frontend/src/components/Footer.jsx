import { Link } from "react-router-dom";
import {
 ShieldCheck,
 Mail,
 Phone,
 MapPin,
 ArrowRight,
 Heart,
 Sparkles,
 Github,
 Twitter,
 Linkedin,
 Instagram,
} from "lucide-react";
import BrandMark from "./BrandMark";

const socialLinks = [
 { icon: Twitter, href: "#", label: "Twitter" },
 { icon: Linkedin, href: "#", label: "LinkedIn" },
 { icon: Instagram, href: "#", label: "Instagram" },
 { icon: Github, href: "#", label: "GitHub" },
];

const footerLinks = [
 {
 title: "Products",
 links: [
 { label: "All Policies", to: "/policies" },
 { label: "Compare Plans", to: "/compare-policies" },
 { label: "AI Recommendations", to: "/recommendations" },
 { label: "Renew Policy", to: "/renewals" },
 { label: "Premium Calculator", to: "/premium-calculator" },
 ],
 },
 {
 title: "Categories",
 links: [
 { label: "Health Insurance", to: "/policies?category=health" },
 { label: "Life Insurance", to: "/policies?category=life" },
 { label: "Car Insurance", to: "/policies?category=car" },
 { label: "Travel Insurance", to: "/policies?category=travel" },
 ],
 },
 {
 title: "Company",
 links: [
 { label: "About Us", to: "/" },
 { label: "Contact", to: "/" },
 { label: "Privacy Policy", to: "/" },
 { label: "Terms of Service", to: "/" },
 ],
 },
];

export default function Footer() {
 return (
 <footer className="relative mt-10 overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 animate-fade-in-up">
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-6 sm:pb-8 pt-8 sm:pt-14 lg:px-8">
 {/* Top section */}
 <div className="grid gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8">
 {/* Brand column */}
 <div className="lg:col-span-4">
 <Link to="/" className="group inline-flex items-center gap-2.5">
 <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition group-hover:scale-105">
 <BrandMark className="h-4 sm:h-5 w-4 sm:w-5" />
 </div>
 <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 ">
 InsureAI
 </span>
 </Link>

 <p className="mt-3 sm:mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-slate-500 ">
 India's first AI-powered insurance marketplace. Compare,
 recommend, and buy the perfect policy — powered by advanced
 machine learning.
 </p>

 {/* Contact info */}
 <div className="mt-4 sm:mt-5 space-y-2">
 <a
 href="mailto:support@insureai.in"
 className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 transition hover:text-indigo-600 "
 >
 <Mail className="h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
 <span className="hidden sm:inline">support@insureai.in</span>
 <span className="inline sm:hidden">Email us</span>
 </a>
 <a
 href="tel:+911800123456"
 className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 transition hover:text-indigo-600 "
 >
 <Phone className="h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
 <span className="hidden sm:inline">
 1800-123-456 (Toll Free)
 </span>
 <span className="inline sm:hidden">Call us</span>
 </a>
 <span className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 ">
 <MapPin className="h-3 sm:h-4 w-3 sm:w-4 shrink-0" />
 Ahmedabad, Gujarat, India
 </span>
 </div>

 {/* Social icons */}
 <div className="mt-4 sm:mt-6 flex items-center gap-2">
 {socialLinks.map((social) => (
 <a
 key={social.label}
 href={social.href}
 className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:-translate-y-0.5 "
 aria-label={social.label}
 >
 <social.icon className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
 </a>
 ))}
 </div>
 </div>

 {/* Link columns */}
 {footerLinks.map((group) => (
 <div key={group.title} className="sm:col-span-3 lg:col-span-2">
 <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-900 ">
 {group.title}
 </h3>
 <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
 {group.links.map((link) => (
 <li key={link.label}>
 <Link
 to={link.to}
 className="group flex items-center gap-1 text-xs sm:text-sm text-slate-500 transition hover:text-indigo-600 "
 >
 {link.label}
 <ArrowRight className="h-3 w-3 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
 </Link>
 </li>
 ))}
 </ul>
 </div>
 ))}

 {/* CTA column */}
 <div className="sm:col-span-3 lg:col-span-2">
 <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-900 ">
 Get Started
 </h3>
 <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-500 ">
 Find the best insurance policy tailored to your needs with AI.
 </p>
 <div className="mt-3 sm:mt-4">
 <Link
 to="/recommendations"
 className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
 >
 <Sparkles className="h-3 sm:h-4 w-3 sm:w-4" />
 <span className="hidden sm:inline">AI Recommend</span>
 <span className="inline sm:hidden">Recommend</span>
 </Link>
 </div>

 {/* Trust badges */}
 <div className="mt-4 sm:mt-6 space-y-2">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 ">
 <ShieldCheck className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
 IRDAI Compliant
 </span>
 <span className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold text-blue-700 ">
 <ShieldCheck className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
 256-bit SSL
 </span>
 </div>
 </div>
 </div>

 {/* Divider */}
 <div className="mt-8 sm:mt-12 border-t border-slate-200 " />

 {/* Bottom bar */}
 <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3 items-center justify-between text-xs text-slate-400 sm:flex-row">
 <p>© {new Date().getFullYear()} InsureAI. All rights reserved.</p>
 <p className="flex items-center gap-1">
 Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />{" "}
 in India
 </p>
 </div>
 </div>
 </footer>
 );
}
