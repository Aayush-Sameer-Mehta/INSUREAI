import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const OptionCardSelector = forwardRef(
  ({ label, options, value, onChange, error, helperText, columns = 2, ...props }, ref) => {
    const columnClass =
      columns <= 1
        ? "grid-cols-1"
        : columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : columns === 3
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

    return (
      <div className="w-full">
        {label && (
          <label className="field-label flex items-center gap-1.5 mb-3 text-sm font-bold text-slate-900">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className={`grid gap-4 ${columnClass}`} role="radiogroup" aria-invalid={error ? "true" : undefined}>
          {options.map((option) => {
            const isSelected = value === option.value;
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col rounded-[20px] border-2 p-5 transition-all outline-none focus-within:ring-4 focus-within:ring-primary-100 ${
                  isSelected
                    ? "border-primary-500 bg-primary-50/50 shadow-md"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                   {Icon && (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isSelected ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                         <Icon className="h-5 w-5" />
                      </div>
                   )}
                   <input
                     type="radio"
                     name={props.name}
                     value={option.value}
                     className="h-5 w-5 border-slate-300 text-primary-600 focus:ring-primary-500"
                     checked={isSelected}
                     onChange={(e) => onChange(e.target.value)}
                     ref={ref}
                   />
                </div>
                <div className="mt-4">
                  <span className={`block text-base font-bold ${isSelected ? "text-primary-900" : "text-slate-900"}`}>
                    {option.label}
                  </span>
                  {option.description && (
                     <span className={`mt-1 block text-sm leading-relaxed ${isSelected ? "text-primary-700/80" : "text-slate-500"}`}>{option.description}</span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        {error ? (
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-2 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

OptionCardSelector.displayName = "OptionCardSelector";
export default OptionCardSelector;
