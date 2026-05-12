import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function resolveStatePath(locationState) {
  const pathFromNestedState = locationState?.from?.pathname;
  const pathFromFlatState = locationState?.fromPath;
  const resolved = pathFromNestedState || pathFromFlatState || "";

  if (
    typeof resolved !== "string" ||
    !resolved.startsWith("/") ||
    resolved.startsWith("//")
  ) {
    return "";
  }

  return resolved;
}

export function useWorkspaceReturn({ fallbackPath = "/user/dashboard" } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const stateFromPath = useMemo(
    () => resolveStatePath(location.state),
    [location.state],
  );

  const canUseStatePath = stateFromPath && stateFromPath !== location.pathname;

  const canUseHistory =
    typeof window !== "undefined" && window.history.length > 1;

  const goBack = () => {
    if (canUseStatePath) {
      navigate(stateFromPath, { replace: true });
      return;
    }

    if (canUseHistory) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath, { replace: true });
  };

  return {
    goBack,
    canUseHistory,
    canUseStatePath,
    fallbackPath,
    stateFromPath,
  };
}

