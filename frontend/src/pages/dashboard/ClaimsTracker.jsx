import { Link } from "react-router-dom";
import {
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  IndianRupee,
  ChevronRight,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../components/common";
import { formatCurrency } from "../../utils/formatters";

const CLAIM_STATUS_CONFIG = {
  Submitted: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-50 ",
    badge: "badge-info",
  },
  "Under Review": {
    icon: Eye,
    color: "text-amber-500",
    bg: "bg-amber-50 ",
    badge: "badge-warning",
  },
  Approved: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50 ",
    badge: "badge-success",
  },
  Rejected: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 ",
    badge: "badge-danger",
  },
  Paid: {
    icon: IndianRupee,
    color: "text-emerald-500",
    bg: "bg-emerald-50 ",
    badge: "badge-success",
  },
};

export default function ClaimsTracker({ claims }) {
  const recentClaims = claims.slice(0, 5);

  return (
    <Card
      padding={false}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 ">
                Claims Tracker
              </h2>
              <p className="text-xs text-slate-500 ">
                {claims.length} total claims
              </p>
            </div>
          </div>
          <Link
            to="/claims"
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 "
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      }
    >
      <div className="divide-y divide-slate-100 ">
        {recentClaims.length > 0 ? (
          recentClaims.map((claim, idx) => {
            const cfg =
              CLAIM_STATUS_CONFIG[claim.status] ||
              CLAIM_STATUS_CONFIG.Submitted;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 "
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}
                >
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 ">
                    {claim.policy?.name || "Insurance Claim"}
                  </p>
                  <p className="text-xs text-slate-500 ">
                    {formatCurrency(claim.claimAmount)} ·{" "}
                    {new Date(claim.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <span className={`badge ${cfg.badge}`}>{claim.status}</span>
              </motion.div>
            );
          })
        ) : (
          <div className="flex flex-col items-center py-12 text-center">
            <Activity className="mb-3 h-10 w-10 text-slate-300 " />
            <p className="text-sm font-medium text-slate-400">
              No claims filed yet
            </p>
            <Link
              to="/claims"
              className="mt-2 text-xs font-semibold text-primary-600 "
            >
              File your first claim →
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
