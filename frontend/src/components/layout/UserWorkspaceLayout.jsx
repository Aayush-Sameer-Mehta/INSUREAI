import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, matchPath, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserSidebar from "../common/UserSidebar";
import WorkspaceBackNav from "../common/WorkspaceBackNav";

const WORKSPACE_ROUTE_META = [
  { pattern: "/user/dashboard", label: "Dashboard", showBack: false },
  { pattern: "/my-policies", label: "My Policies" },
  { pattern: "/claims", label: "Claims" },
  { pattern: "/renewals", label: "Renewals" },
  { pattern: "/profile", label: "Profile" },
  { pattern: "/preferences", label: "Preferences" },
  { pattern: "/onboarding", label: "Onboarding" },
  {
    pattern: "/payment/:policyId",
    label: "Secure Checkout",
    parentLabel: "My Policies",
    parentTo: "/my-policies",
  },
];

function resolveWorkspaceRouteMeta(pathname) {
  const matchedMeta = WORKSPACE_ROUTE_META.find((meta) =>
    matchPath({ path: meta.pattern, end: true }, pathname),
  );

  return (
    matchedMeta || {
      label: "Workspace",
      showBack: true,
    }
  );
}

export default function UserWorkspaceLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const routeMeta = useMemo(
    () => resolveWorkspaceRouteMeta(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="mx-auto w-full max-w-[1460px] px-3 pb-16 pt-4 sm:px-5 sm:pt-6 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <UserSidebar compact />
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-sm sm:px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
                aria-label="Open workspace navigation"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              <div className="min-w-0 flex-1">
                <WorkspaceBackNav
                  currentLabel={routeMeta.label}
                  parentLabel={routeMeta.parentLabel}
                  parentTo={routeMeta.parentTo}
                  showBack={routeMeta.showBack !== false}
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6 pb-8 sm:pb-10">
            <Outlet />
          </div>
        </section>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close workspace navigation"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[82%] max-w-[310px] border-r border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <Link
                to="/user/dashboard"
                className="text-sm font-bold text-slate-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Workspace
              </Link>
              <button
                type="button"
                aria-label="Close workspace navigation"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <UserSidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

