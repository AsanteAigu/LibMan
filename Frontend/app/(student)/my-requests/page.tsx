"use client";

import { useBorrowRequests } from "@/features/loans/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import type { BorrowRequest } from "@/types/loan";

const columns: DataTableColumn<BorrowRequest>[] = [
  { key: "bookTitle", header: "Title", render: (r) => r.bookTitle, sortValue: (r) => r.bookTitle },
  {
    key: "requestedAt",
    header: "Requested",
    render: (r) => formatDateTime(r.requestedAt),
    sortValue: (r) => r.requestedAt,
  },
  { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  {
    key: "note",
    header: "Note",
    render: (r) => r.rejectionReason ?? "—",
  },
];

export default function MyRequestsPage() {
  const { data: requests, isLoading } = useBorrowRequests({ mine: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          My Requests
        </h1>
        <p className="text-body-md text-on-surface-variant">Borrow requests you&apos;ve sent to the library</p>
      </div>
      <DataTable
        columns={columns}
        data={requests ?? []}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No requests yet"
        emptyDescription="Request a book from its detail page to see it here."
      />
    </div>
  );
}
