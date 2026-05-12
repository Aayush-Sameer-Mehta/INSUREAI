import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  FileText,
  RefreshCw,
  BrainCircuit,
  User,
  Settings,
  Sparkles,
} from "lucide-react";

export const USER_WORKSPACE_NAV_ITEMS = [
  { to: "/user/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/my-policies", icon: Shield, label: "My Policies" },
  { to: "/claims", icon: FileText, label: "Claims" },
  { to: "/renewals", icon: RefreshCw, label: "Renewals" },
  { to: "/recommendations", icon: BrainCircuit, label: "AI Suggestions" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/preferences", icon: Settings, label: "Preferences" },
];

export default function UserSidebar({ onNavigate, compact = false }) {
  const location = useLocation();

  const navState = {
    from: {
      pathname: location.pathname,
    },
  };

  return (
    <div className="flex h-full flex-col">
      <div className={`px-2 ${compact ? "mb-4" : "mb-6"}`}>
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          Navigation
        </h2>
      </div>

      <nav className="flex-1 space-y-1.5">
        {USER_WORKSPACE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            state={navState}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-4.5 w-4.5 ${
                    isActive
                      ? "text-primary-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 to-cyan-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-bold text-primary-800">
              Workspace Tip
            </span>
          </div>
          <p className="text-[11px] leading-5 text-slate-600">
            Use the breadcrumb and back action above each page to return to
            your previous workspace context quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
