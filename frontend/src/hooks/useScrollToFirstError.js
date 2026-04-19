import { useEffect } from "react";

function findFirstErrorPath(errors, parentPath = "") {
  if (!errors || typeof errors !== "object") return null;

  for (const key of Object.keys(errors)) {
    const nextPath = parentPath ? `${parentPath}.${key}` : key;
    const value = errors[key];

    if (!value || typeof value !== "object") continue;

    if ("message" in value || "type" in value) {
      return nextPath;
    }

    const nestedPath = findFirstErrorPath(value, nextPath);
    if (nestedPath) return nestedPath;
  }

  return null;
}

export function useScrollToFirstError(errors, submitCount) {
  useEffect(() => {
    if (!submitCount || !errors || Object.keys(errors).length === 0) return;

    const firstErrorPath = findFirstErrorPath(errors);
    if (!firstErrorPath) return;

    const escapedPath = firstErrorPath.replace(/"/g, '\\"');
    const target =
      document.querySelector(`[name="${escapedPath}"]`) ||
      document.getElementById(escapedPath);

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  }, [errors, submitCount]);
}

