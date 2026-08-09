import type { ReactNode } from "react";

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border border-dashed border-outline-variant">
      <span className="material-symbols-outlined text-outline text-[40px] mb-3">{icon}</span>
      <p className="font-headline-md text-headline-md text-on-surface mb-1">{title}</p>
      {description && (
        <p className="text-body-md text-on-surface-variant max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
