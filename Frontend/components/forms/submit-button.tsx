import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  isLoading,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={isLoading || props.disabled}
      className={cn(
        "w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      {isLoading && (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      )}
      {children}
    </button>
  );
}
