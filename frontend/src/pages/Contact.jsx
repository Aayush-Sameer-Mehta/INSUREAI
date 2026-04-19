import { useState } from "react";
import {
 Mail,
 Phone,
 MapPin,
 Clock,
 Send,
 Loader2,
 MessageSquare,
 Headphones,
 ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── animation variants ─────────────────────────────── */



/* ─── contact info cards ─────────────────────────────── */
const CONTACT_INFO = [
 { icon: Mail, label: "Email Us", value: "support@insureai.in", href: "mailto:support@insureai.in", gradient: "from-indigo-500 to-violet-600" },
 { icon: Phone, label: "Call Us", value: "+91 79 1234 5678", href: "tel:+917912345678", gradient: "from-emerald-500 to-teal-600" },
 { icon: MapPin, label: "Visit Us", value: "Ahmedabad, Gujarat, India", href: null, gradient: "from-amber-500 to-orange-600" },
 { icon: Clock, label: "Working Hours", value: "Mon–Sat, 9 AM – 6 PM IST", href: null, gradient: "from-rose-500 to-pink-600" },
];

/* ─── FAQ data ───────────────────────────────────────── */
const FAQS = [
 { q: "How do I purchase a policy?", a: "Browse our Policies page, compare plans, and click 'View Details' on your preferred policy. From there, proceed to payment." },
 { q: "How long does claim processing take?", a: "Claims are typically reviewed within 3–5 business days. You can track the status in real-time on the Claims page." },
 { q: "Can I cancel my policy?", a: "Yes, you can request policy cancellation by contacting our support team via email or phone within the free-look period." },
 { q: "Are my payments secure?", a: "Absolutely. All transactions are encrypted with 256-bit SSL and processed through verified payment gateways." },
 { q: "How does AI recommendation work?", a: "Our AI analyzes your profile, risk appetite, and needs to suggest the most suitable policies from our curated catalogue." },
];

export default function Contact() {
 const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
 const [sending, setSending] = useState(false);
 const [expandedFaq, setExpandedFaq] = useState(null);

 const onSubmit = async (e) => {
 e.preventDefault();
 if (!form.name || !form.email || !form.message) {
 toast.error("Please fill all required fields");
 return;
 }
 setSending(true);
 /* Simulate sending — replace with real API call when backend endpoint is ready */
 await new Promise((r) => setTimeout(r, 1200));
 setSending(false);
 setForm({ name: "", email: "", subject: "", message: "" });
 toast.success("Message sent! We'll get back to you soon.");
 };

 return (
 <div className="page-shell">
 {/* Hero */}
 <div initial="hidden" animate="visible" className="text-center">
 <div
 className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/25"
 >
 <Headphones className="h-8 w-8 text-white" />
 </div>
 <h1 className="section-title">Contact & Support</h1>
 <p className="section-subtitle mx-auto mt-2 max-w-lg">
 Have questions or need help? We're here for you. Reach out through any channel below or send us a message.
 </p>
 </div>

 {/* Contact info cards */}
 <div initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {CONTACT_INFO.map((info) => {
 const Icon = info.icon;
 const Wrapper = info.href ? "a" : "div";
 return (
 <div key={info.label}>
 <Wrapper
 {...(info.href ? { href: info.href } : {})}
 className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:border-indigo-200 hover:shadow-md "
 >
 <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${info.gradient} text-white shadow-md transition group-hover:scale-110`}>
 <Icon className="h-5 w-5" />
 </div>
 <p className="text-sm font-semibold text-slate-900 ">{info.label}</p>
 <p className="mt-1 text-xs text-slate-500 ">{info.value}</p>
 </Wrapper>
 </div>
 );
 })}
 </div>

 {/* Two-column: Form + FAQ */}
 <div className="grid gap-6 lg:grid-cols-5">
 {/* Contact form */}
 <div initial="hidden" animate="visible" className="lg:col-span-3">
 <div className="panel overflow-hidden">
 <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 ">
 <MessageSquare className="h-5 w-5 text-white" />
 <div>
 <h2 className="text-base font-semibold text-white">Send a Message</h2>
 <p className="text-xs text-white/70">We'll respond within 24 hours</p>
 </div>
 </div>
 <form onSubmit={onSubmit} className="space-y-4 p-6">
 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-sm font-semibold text-slate-700 ">Full Name *</label>
 <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="field" placeholder="Your name" required />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-semibold text-slate-700 ">Email *</label>
 <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="field" placeholder="your@email.com" required />
 </div>
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-semibold text-slate-700 ">Subject</label>
 <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className="field" placeholder="What is this about?" />
 </div>
 <div>
 <label className="mb-1.5 block text-sm font-semibold text-slate-700 ">Message *</label>
 <textarea
 value={form.message}
 onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
 className="field min-h-[120px] resize-none"
 placeholder="Tell us how we can help..."
 required
 />
 </div>
 <button
 type="submit"
 disabled={sending}
 className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition disabled:opacity-40"
 >
 {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
 {sending ? "Sending..." : "Send Message"}
 </button>
 </form>
 </div>
 </div>

 {/* FAQ */}
 <div initial="hidden" animate="visible" className="lg:col-span-2">
 <div className="panel overflow-hidden">
 <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 ">
 <ShieldCheck className="h-5 w-5 text-white" />
 <div>
 <h2 className="text-base font-semibold text-white">FAQ</h2>
 <p className="text-xs text-white/70">Quick answers to common questions</p>
 </div>
 </div>
 <div className="divide-y divide-slate-100 ">
 {FAQS.map((faq, i) => (
 <button
 key={i}
 type="button"
 onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
 className="w-full px-6 py-4 text-left transition hover:bg-slate-50 "
 >
 <p className="text-sm font-semibold text-slate-900 ">{faq.q}</p>
 <div
 className="overflow-hidden"
 >
 <p className="mt-2 text-xs leading-relaxed text-slate-500 ">{faq.a}</p>
 </div>
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
