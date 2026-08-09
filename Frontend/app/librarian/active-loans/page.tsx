"use client";

import { useState } from "react";
import { useLoans, useCollectLoan, useReturnLoan } from "@/features/loans/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { formatDate } from "@/lib/format";
import type { Loan, ReturnCondition } from "@/types/loan";

const CONDITIONS: { value: ReturnCondition; label: string }[] = [
  { value: "ok", label: "Good condition" },
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
];

export default function ActiveLoansPage() {
  const { data: loans, isLoading } = useLoans();
  const collect = useCollectLoan();
  const returnLoan = useReturnLoan();
  const [returning, setReturning] = useState<Loan | null>(null);
  const [condition, setCondition] = useState<ReturnCondition>("ok");

  const active = (loans ?? []).filter((l) => l.loanState !== "returned");

  const columns: DataTableColumn<Loan>[] = [
    { key: "userName", header: "Student", render: (l) => l.userName, sortValue: (l) => l.userName },
    { key: "bookTitle", header: "Title", render: (l) => l.bookTitle },
    { key: "shelfLocation", header: "Shelf", render: (l) => l.shelfLocation ?? "—" },
    { key: "dueDate", header: "Due", render: (l) => formatDate(l.dueDate), sortValue: (l) => l.dueDate ?? "" },
    { key: "loanState", header: "Status", render: (l) => <StatusBadge status={l.loanState} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Active Loans Management</h1>
        <p className="text-body-md text-on-surface-variant">Collect holds and process returns</p>
      </div>

      <DataTable
        columns={columns}
        data={active}
        getRowId={(l) => l.id}
        isLoading={isLoading}
        emptyTitle="No active loans"
        rowActions={(l) =>
          l.loanState === "on_hold" ? (
            <button
              onClick={() => collect.mutate(l.id)}
              disabled={collect.isPending}
              className="text-label-sm font-label-sm text-primary hover:underline disabled:opacity-50"
            >
              Mark collected
            </button>
          ) : (
            <button
              onClick={() => setReturning(l)}
              className="text-label-sm font-label-sm text-primary hover:underline"
            >
              Process return
            </button>
          )
        }
      />

      <ConfirmationDialog
        open={!!returning}
        onOpenChange={(open) => !open && setReturning(null)}
        title="Process return"
        description={`Confirm the condition of "${returning?.bookTitle ?? ""}" as returned by ${returning?.userName ?? ""}.`}
        confirmLabel="Confirm return"
        isLoading={returnLoan.isPending}
        onConfirm={() => {
          if (!returning) return;
          returnLoan.mutate({ id: returning.id, condition }, { onSuccess: () => setReturning(null) });
        }}
      >
        <div className="flex flex-col gap-2 mt-2">
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2 text-body-md text-on-surface">
              <input
                type="radio"
                name="condition"
                checked={condition === c.value}
                onChange={() => setCondition(c.value)}
                className="accent-primary"
              />
              {c.label}
            </label>
          ))}
        </div>
      </ConfirmationDialog>
    </div>
  );
}
