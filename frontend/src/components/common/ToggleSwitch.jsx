import { forwardRef } from "react";
import { motion } from "framer-motion";

const ToggleSwitch = forwardRef(
  ({ label, description, error, checked, onChange, disabled, ...props }, ref) => {
    return (
      <label
        className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-all ${
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-slate-300"
        } ${error ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}
      >
        <div className="flex-1">
          <p className={`text-sm font-semibold ${error ? "text-red-700" : "text-slate-900"}`}>
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {description && (
            <p className={`mt-1 text-xs ${error ? "text-red-600" : "text-slate-500"}`}>
              {description}
            </p>
          )}
          {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
        </div>
        <div className="relative inline-flex h-6 w-11 shrink-0 items-center justify-center pt-0.5">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 peer-checked:bg-primary-600"></div>
          <span
            className={`absolute left-[2px] top-[2px] h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-full" : "translate-x-0"
            }`}
          ></span>
        </div>
      </label>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";
export default ToggleSwitch;
