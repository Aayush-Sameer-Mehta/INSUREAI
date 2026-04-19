import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
 (
 {
 label,
 error,
 helper,
 children,
 icon: Icon,
 className = "",
 wrapperClass = "",
 id,
 ...props
 },
 ref
 ) => {
 const inputId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;
 const errorId = `${inputId}-error`;
 const helperId = `${inputId}-helper`;
 const stateClass = error ? "field-error" : "field";

 return (
 <div className={wrapperClass}>
 {label && (
 <label htmlFor={inputId} className="field-label">
 {Icon && <Icon className="mr-1 inline h-4 w-4 text-primary-500" />}
 {label}
 {props.required && <span className="ml-1 text-red-500">*</span>}
 </label>
 )}
 <div className="relative">
 <select
 ref={ref}
 id={inputId}
 className={`${stateClass} appearance-none !pr-10 ${className}`}
 aria-invalid={error ? "true" : undefined}
 aria-describedby={error ? errorId : helper ? helperId : undefined}
 {...props}
 >
 {children}
 </select>
 <ChevronDown className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
 </div>
 {error && (
 <p id={errorId} className="field-error-text" role="alert">{error}</p>
 )}
 {!error && helper && (
 <p id={helperId} className="field-helper">{helper}</p>
 )}
 </div>
 );
 }
);

Select.displayName = "Select";
export default Select;
