import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon?: string;
  tone?: "default" | "warning" | "error";
}) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 flex items-start justify-between">
      <div>
        <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">{label}</p>
        <p
          className={cn(
            "text-headline-lg-mobile font-headline-lg-mobile",
            tone === "warning" && "text-on-tertiary-fixed-variant",
            tone === "error" && "text-error",
            tone === "default" && "text-primary"
          )}
        >
          {value}
        </p>
      </div>
      {icon && (
        <span className="material-symbols-outlined text-on-surface-variant text-[28px]">
          {icon}
        </span>
      )}
    </div>
  );
}
