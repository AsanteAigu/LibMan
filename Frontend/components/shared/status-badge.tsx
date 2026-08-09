import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "error" | "neutral" | "info";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  warning: "bg-secondary-fixed text-on-secondary-fixed-variant",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
  info: "bg-primary-fixed text-on-primary-fixed-variant",
};

const STATUS_TONE: Record<string, Tone> = {
  available: "success",
  approved: "success",
  on_loan: "info",
  paid: "success",
  fulfilled: "success",
  active: "success",
  ok: "success",
  on_hold: "warning",
  pending: "warning",
  waiting: "warning",
  notified: "warning",
  grace: "warning",
  unpaid: "error",
  rejected: "error",
  overdue: "error",
  withdrawn: "error",
  damaged: "error",
  lost: "error",
  expired: "neutral",
  cancelled: "neutral",
  returned: "neutral",
  removed: "neutral",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm capitalize",
        TONE_CLASSES[tone]
      )}
    >
      {(label ?? status).replace(/_/g, " ")}
    </span>
  );
}
