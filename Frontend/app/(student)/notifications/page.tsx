"use client";

import { useAuth } from "@/hooks/use-auth";
import { useNotifications, useMarkNotificationRead } from "@/features/notifications/hooks";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, string> = {
  reservation_ready: "local_library",
  charge_created: "receipt_long",
  due_soon: "schedule",
  hold_expired: "event_busy",
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(!!user);
  const markRead = useMarkNotificationRead();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          Notifications
        </h1>
        <p className="text-body-md text-on-surface-variant">Updates about your loans, holds, and charges</p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : notifications && notifications.length > 0 ? (
        <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn(
                "flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-container-low/60",
                !n.read && "bg-primary-fixed/20"
              )}
            >
              <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                {TYPE_ICON[n.type] ?? "notifications"}
              </span>
              <div className="flex-1">
                <p className="text-body-md text-on-surface">{n.message}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-0.5">
                  {formatDateTime(n.createdAt)}
                </p>
              </div>
              {!n.read && <span className="size-2 rounded-full bg-primary mt-2" aria-label="Unread" />}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState icon="notifications" title="You're all caught up" description="No notifications right now." />
      )}
    </div>
  );
}
