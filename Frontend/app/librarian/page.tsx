"use client";

import Link from "next/link";
import { useLibrarianStats } from "@/features/admin/hooks";
import { useBorrowRequests } from "@/features/loans/hooks";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import { ROUTES } from "@/constants/routes";

export default function LibrarianDashboardPage() {
  const { data: stats, isLoading } = useLibrarianStats();
  const { data: pending, isLoading: pendingLoading } = useBorrowRequests({ status: "pending" });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Today&apos;s Overview</h1>
        <p className="text-body-md text-on-surface-variant">Circulation activity across the library</p>
      </div>

      {isLoading || !stats ? (
        <StatCardsSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Pending requests" value={stats.pendingRequests} icon="assignment" tone="warning" />
          <StatCard label="Active loans" value={stats.activeLoans} icon="menu_book" />
          <StatCard label="Returned today" value={stats.returnedToday} icon="task_alt" />
          <StatCard label="Reservations waiting" value={stats.reservationsWaiting} icon="bookmark" />
          <StatCard label="Overdue books" value={stats.overdueBooks} icon="warning" tone="error" />
          <StatCard
            label="Inventory available"
            value={`${stats.inventoryAvailable}/${stats.inventoryTotal}`}
            icon="inventory_2"
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-md text-headline-md text-on-surface">Pending borrow requests</h2>
          <Link
            href={ROUTES.borrowRequests}
            className="text-label-md font-label-md text-primary hover:underline"
          >
            View queue
          </Link>
        </div>
        {pendingLoading ? (
          <TableSkeleton rows={3} />
        ) : pending && pending.length > 0 ? (
          <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {pending.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{request.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    {request.userName} · {formatDateTime(request.requestedAt)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="task_alt" title="No pending requests" description="The queue is clear." />
        )}
      </div>
    </div>
  );
}
