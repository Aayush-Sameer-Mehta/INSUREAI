import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const RadioGroup = forwardRef(
  ({ label, options, value, onChange, error, helperText, columns = 1, ...props }, ref) => {
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
          <label className="field-label flex items-center gap-1.5 mb-2 text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className={`grid gap-3 ${columnClass}`} role="radiogroup" aria-invalid={error ? "true" : undefined}>
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  isSelected
                    ? "border-primary-500 bg-primary-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex h-5 items-center">
                  <input
                    type="radio"
                    name={props.name}
                    value={option.value}
                    className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={isSelected}
                    onChange={(e) => onChange(e.target.value)}
                    ref={ref}
                  />
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isSelected ? "text-primary-900" : "text-slate-700"}`}>
                    {option.label}
                  </span>
                  {option.description && (
                     <span className="text-xs text-slate-500 mt-0.5">{option.description}</span>
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

RadioGroup.displayName = "RadioGroup";
export default RadioGroup;
