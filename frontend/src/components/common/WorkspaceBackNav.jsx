import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { useWorkspaceReturn } from "../../hooks/useWorkspaceReturn";

export default function WorkspaceBackNav({
  currentLabel,
  parentLabel = "",
  parentTo = "",
  showBack = true,
}) {
  const { goBack } = useWorkspaceReturn();

  const breadcrumbs = [{ label: "Dashboard", to: "/user/dashboard" }];

  if (parentLabel && parentLabel !== "Dashboard") {
    breadcrumbs.push({ label: parentLabel, to: parentTo || "/user/dashboard" });
  }

  if (currentLabel && currentLabel !== "Dashboard") {
    breadcrumbs.push({ label: currentLabel });
  }

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        )}

        <nav
          aria-label="Workspace breadcrumb"
          className="flex items-center overflow-x-auto whitespace-nowrap text-xs font-medium text-slate-500"
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={`${crumb.label}-${index}`} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-slate-300" />
                )}

                {isLast || !crumb.to ? (
                  <span className="text-slate-700">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="inline-flex items-center gap-1 transition hover:text-primary-600"
                  >
                    {crumb.label === "Dashboard" ? (
                      <>
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        Dashboard
                      </>
                    ) : (
                      crumb.label
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

