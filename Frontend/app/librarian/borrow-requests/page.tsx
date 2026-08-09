"use client";

import { useState } from "react";
import { useBorrowRequests, useApproveBorrowRequest, useRejectBorrowRequest } from "@/features/loans/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { formatDateTime } from "@/lib/format";
import type { BorrowRequest } from "@/types/loan";

export default function BorrowRequestsPage() {
  const { data: requests, isLoading } = useBorrowRequests();
  const approve = useApproveBorrowRequest();
  const reject = useRejectBorrowRequest();
  const [rejecting, setRejecting] = useState<BorrowRequest | null>(null);
  const [reason, setReason] = useState("");

  const columns: DataTableColumn<BorrowRequest>[] = [
    { key: "userName", header: "Student", render: (r) => r.userName, sortValue: (r) => r.userName },
    { key: "bookTitle", header: "Title", render: (r) => r.bookTitle },
    {
      key: "requestedAt",
      header: "Requested",
      render: (r) => formatDateTime(r.requestedAt),
      sortValue: (r) => r.requestedAt,
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Borrow Requests Queue</h1>
        <p className="text-body-md text-on-surface-variant">Approve or reject pending borrow requests</p>
      </div>

      <DataTable
        columns={columns}
        data={requests ?? []}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No requests"
        rowActions={(r) =>
          r.status === "pending" ? (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => approve.mutate(r.id)}
                disabled={approve.isPending}
                className="text-label-sm font-label-sm text-primary hover:underline disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => setRejecting(r)}
                className="text-label-sm font-label-sm text-error hover:underline"
              >
                Reject
              </button>
            </div>
          ) : null
        }
      />

      <ConfirmationDialog
        open={!!rejecting}
        onOpenChange={(open) => !open && setRejecting(null)}
        title="Reject this request?"
        description={`This tells ${rejecting?.userName ?? "the student"} why "${rejecting?.bookTitle ?? ""}" couldn't be issued.`}
        confirmLabel="Reject request"
        destructive
        isLoading={reject.isPending}
        onConfirm={() => {
          if (!rejecting) return;
          reject.mutate(
            { id: rejecting.id, reason: reason || "No copies currently available" },
            { onSuccess: () => setRejecting(null) }
          );
        }}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-full mt-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-md"
          rows={2}
        />
      </ConfirmationDialog>
    </div>
  );
}
