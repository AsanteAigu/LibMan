import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, helperText, icon, id, className, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div>
        <label htmlFor={fieldId} className="block font-label-md text-label-md text-on-surface mb-1.5">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
            className={cn(
              "block w-full py-2 px-3 border rounded-lg bg-surface-container-low text-on-surface placeholder:text-on-surface-variant transition-colors sm:text-body-md focus:outline-none focus:ring-2",
              icon && "pl-10",
              error
                ? "border-error focus:ring-error focus:border-error"
                : "border-outline-variant focus:ring-primary focus:border-primary",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${fieldId}-error`} className="mt-1 text-label-sm font-label-sm text-error">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${fieldId}-helper`} className="mt-1 text-label-sm font-label-sm text-on-surface-variant">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
TextField.displayName = "TextField";
