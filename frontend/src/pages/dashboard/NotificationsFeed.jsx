import {
 Bell,
 FileText,
 CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../components/common";

export default function NotificationsFeed({ notifications, onMarkRead }) {
 const unread = notifications.filter((n) => !n.isRead).slice(0, 6);

 return (
 <Card
 padding={false}
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20">
 <Bell className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-900 ">Notifications</h2>
 <p className="text-xs text-slate-500 ">{unread.length} unread</p>
 </div>
 </div>
 </div>
 }
 >
 <div className="divide-y divide-slate-100 ">
 {unread.length > 0 ? (
 unread.map((notif, idx) => {
 const isClaimNotif = notif.type === "claim";
 const isPaymentNotif = notif.type === "payment";
 const NotifIcon = isClaimNotif ? FileText : isPaymentNotif ? CreditCard : Bell;
 const notifBg = isClaimNotif ? "bg-primary-50 " : isPaymentNotif ? "bg-emerald-50 " : "bg-blue-50 ";
 const notifColor = isClaimNotif ? "text-primary-500" : isPaymentNotif ? "text-emerald-500" : "text-blue-500";
 return (
 <motion.div
 key={notif._id}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.04 }}
 className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-slate-50/50 "
 >
 <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notifBg}`}>
 <NotifIcon className={`h-4 w-4 ${notifColor}`} />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-semibold text-slate-900 ">{notif.title}</p>
 <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
 <p className="mt-1 text-[10px] text-slate-400 ">
 {new Date(notif.createdAt).toLocaleString("en-IN", {
 day: "numeric",
 month: "short",
 year: "numeric",
 hour: "2-digit",
 minute: "2-digit",
 })}
 </p>
 </div>
 <button
 onClick={() => onMarkRead(notif._id)}
 className="mt-1 shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 transition hover:bg-slate-200 "
 >
 Mark read
 </button>
 </motion.div>
 );
 })
 ) : (
 <div className="flex flex-col items-center py-12 text-center">
 <Bell className="mb-3 h-10 w-10 text-slate-300 " />
 <p className="text-sm font-medium text-slate-400">All caught up! 🎉</p>
 </div>
 )}
 </div>
 </Card>
 );
}
