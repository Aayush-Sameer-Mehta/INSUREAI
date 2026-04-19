import { forwardRef } from "react";

const Input = forwardRef(
 (
 {
 label,
 error,
 success,
 helper,
 icon: Icon,
 iconRight: IconRight,
 className = "",
 wrapperClass = "",
 id,
 ...props
 },
 ref
 ) => {
 const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

 const stateClass = error
 ? "field-error"
 : success
 ? "field-success"
 : "field";

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
 {Icon && !label && (
 <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
 )}
 <input
 ref={ref}
 id={inputId}
 className={`${stateClass} ${Icon && !label ? "!pl-10" : ""} ${IconRight ? "!pr-10" : ""} ${className}`}
 aria-invalid={error ? "true" : undefined}
 aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
 {...props}
 />
 {IconRight && (
 <IconRight className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
 )}
 </div>
 {error && (
 <p id={`${inputId}-error`} className="field-error-text" role="alert">
 {error}
 </p>
 )}
 {!error && success && (
 <p className="mt-1 text-xs font-medium text-emerald-600 ">
 {success}
 </p>
 )}
 {!error && !success && helper && (
 <p id={`${inputId}-helper`} className="field-helper">
 {helper}
 </p>
 )}
 </div>
 );
 }
);

Input.displayName = "Input";
export default Input;
