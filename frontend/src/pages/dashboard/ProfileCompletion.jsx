import { useMemo } from "react";
import { Link } from "react-router-dom";
import { UserCheck, ShieldCheck, Target, Trophy, ArrowRight, Zap, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../components/common";

export default function ProfileCompletion({ profile }) {
 const { score, missingFields } = useMemo(() => {
 if (!profile) return { score: 0, missingFields: [] };

 const checks = [
 { field: "dateOfBirth", label: "Date of Birth", points: 15, route: "/profile" },
 { field: "occupation", label: "Occupation", points: 15, route: "/profile" },
 { field: "annualIncome", label: "Annual Income", points: 15, route: "/profile" },
 { field: "nomineeName", label: "Nominee Details", points: 15, route: "/profile" },
 { 
 field: "kycDetails.isKycVerified", 
 label: "KYC Verification", 
 points: 20, 
 route: "/profile",
 check: (p) => p.kycDetails?.isKycVerified 
 },
 { 
 field: "dependents", 
 label: "Add Family Dependents", 
 points: 20, 
 route: "/user/dashboard",
 check: (p) => p.dependents && p.dependents.length > 0
 }
 ];

 let currentScore = 0;
 const missing = [];

 checks.forEach((item) => {
 let passed = false;
 if (item.check) passed = item.check(profile);
 else passed = Boolean(profile[item.field]);

 if (passed) currentScore += item.points;
 else missing.push(item);
 });

 return { score: currentScore, missingFields: missing };
 }, [profile]);

 return (
 <Card
 padding={false}
 header={
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-600 shadow-md shadow-indigo-500/20">
 <Trophy className="h-4.5 w-4.5 text-white" />
 </div>
 <div className="flex-1 min-w-0">
 <h2 className="text-base font-bold text-slate-900 ">Profile Strength</h2>
 <div className="mt-1 flex items-center gap-2">
 <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 ">
 <motion.div 
 className={`h-full rounded-full ${score === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} 
 initial={{ width: 0 }} 
 animate={{ width: `${score}%` }} 
 transition={{ duration: 1 }} 
 />
 </div>
 <span className="text-[10px] font-bold text-slate-500">{score}%</span>
 </div>
 </div>
 </div>
 }
 >
 <div className="p-5 space-y-4">
 {score === 100 ? (
 <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 text-center ">
 <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-50 ">
 <ShieldCheck className="h-8 w-8" />
 </div>
 <h3 className="font-bold text-emerald-900 ">All Star Profile!</h3>
 <p className="mt-1 max-w-[200px] text-xs leading-relaxed text-emerald-700 ">
 Your profile is fully verified. You have unlocked faster claims and personalized pricing.
 </p>
 </div>
 ) : (
 <>
 <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 ">
 <p className="text-xs font-medium text-indigo-800 ">
 Complete your profile to unlock accurate AI recommendations and speed up future claims.
 </p>
 </div>
 
 <div className="space-y-2.5">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Steps</p>
 {missingFields.slice(0, 3).map((item, idx) => (
 <Link 
 key={idx} 
 to={item.route}
 className="group flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100 "
 >
 <div className="flex items-center gap-3 text-sm">
 <Target className="h-4 w-4 text-slate-400 group-hover:text-indigo-500" />
 <span className="font-medium text-slate-700 ">{item.label}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-indigo-600 ">+{item.points}</span>
 <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500" />
 </div>
 </Link>
 ))}
 </div>
 </>
 )}
 </div>
 </Card>
 );
}
