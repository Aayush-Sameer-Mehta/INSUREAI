import roleGuard from "./roleGuard.js";

export default function authorize(roles = []) {
  return roleGuard(Array.isArray(roles) ? roles : [roles]);
}
