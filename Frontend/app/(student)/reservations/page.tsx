"use client";

import { useReservations, useCancelReservation } from "@/features/loans/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import type { Reservation } from "@/types/loan";

export default function ReservationsPage() {
  const { data: reservations, isLoading } = useReservations({ mine: true });
  const cancelReservation = useCancelReservation();

  const columns: DataTableColumn<Reservation>[] = [
    { key: "bookTitle", header: "Title", render: (r) => r.bookTitle, sortValue: (r) => r.bookTitle },
    { key: "queuePosition", header: "Queue position", render: (r) => `#${r.queuePosition}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "windowExpiresAt",
      header: "Pickup window",
      render: (r) => (r.windowExpiresAt ? formatDateTime(r.windowExpiresAt) : "—"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          Reservations
        </h1>
        <p className="text-body-md text-on-surface-variant">Your place in line for titles that are on loan</p>
      </div>
      <DataTable
        columns={columns}
        data={reservations ?? []}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No reservations"
        emptyDescription="Reserve a book that's currently unavailable and it'll appear here."
        rowActions={(r) =>
          r.status === "waiting" || r.status === "notified" ? (
            <button
              onClick={() => cancelReservation.mutate(r.id)}
              disabled={cancelReservation.isPending}
              className="text-label-sm font-label-sm text-error hover:underline disabled:opacity-50"
            >
              Cancel
            </button>
          ) : null
        }
      />
    </div>
  );
}
