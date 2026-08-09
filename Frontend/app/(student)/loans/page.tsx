"use client";

import { useLoans, useExtendLoan } from "@/features/loans/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import type { Loan } from "@/types/loan";

export default function LoansPage() {
  const { data: loans, isLoading } = useLoans({ mine: true });
  const extendLoan = useExtendLoan();

  const columns: DataTableColumn<Loan>[] = [
    { key: "bookTitle", header: "Title", render: (l) => l.bookTitle, sortValue: (l) => l.bookTitle },
    { key: "shelfLocation", header: "Shelf", render: (l) => l.shelfLocation ?? "—" },
    {
      key: "dueDate",
      header: "Due",
      render: (l) => (l.extended ? formatDate(l.extendedDueDate) : formatDate(l.dueDate)),
      sortValue: (l) => l.dueDate ?? "",
    },
    { key: "loanState", header: "Status", render: (l) => <StatusBadge status={l.loanState} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          My Loans
        </h1>
        <p className="text-body-md text-on-surface-variant">Books currently on hold or checked out to you</p>
      </div>
      <DataTable
        columns={columns}
        data={loans ?? []}
        getRowId={(l) => l.id}
        isLoading={isLoading}
        emptyTitle="No active loans"
        emptyDescription="Books you borrow will show up here."
        rowActions={(l) =>
          l.loanState === "on_loan" && !l.extended ? (
            <button
              onClick={() => extendLoan.mutate(l.id)}
              disabled={extendLoan.isPending}
              className="text-label-sm font-label-sm text-primary hover:underline disabled:opacity-50"
            >
              Extend
            </button>
          ) : null
        }
      />
    </div>
  );
}
