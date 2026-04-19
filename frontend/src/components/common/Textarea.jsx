import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      helper,
      className = "",
      icon: Icon,
      id,
      wrapperClass = "",
      ...props
    },
    ref,
  ) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, "-")}`;
    const helperMessage = helperText || helper;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className={`w-full ${wrapperClass}`}>
        {label && (
          <label htmlFor={textareaId} className="field-label flex items-center gap-1.5 mb-1.5 text-sm font-medium text-slate-700">
            {Icon && <Icon className="h-4 w-4 text-primary-500" />}
            {label}
            {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            className={`${error ? "field-error" : "field"} min-h-[100px] resize-y ${className}`}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : helperMessage ? helperId : undefined}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500 animate-fade-in-up" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : helperMessage ? (
          <p id={helperId} className="mt-1.5 text-xs text-slate-500">{helperMessage}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
