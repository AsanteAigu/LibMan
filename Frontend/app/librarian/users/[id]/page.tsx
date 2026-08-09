"use client";

import { use, useState } from "react";
import { useUserHistory } from "@/features/admin/hooks";
import { useUsers } from "@/features/admin/hooks";
import { usePayCharge } from "@/features/billing/hooks";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";

export default function UserLookupPage({ params }: PageProps<"/librarian/users/[id]">) {
  const { id } = use(params);
  const { data: users } = useUsers();
  const { data: history, isLoading } = useUserHistory(id);
  const payCharge = usePayCharge();
  const [payingId, setPayingId] = useState<string | null>(null);

  const patron = users?.find((u) => u.id === id);

  if (isLoading || !patron) {
    return <div className="animate-pulse h-96 rounded-lg bg-surface-container-high" />;
  }

  const handleRecordCash = async (chargeId: string) => {
    setPayingId(chargeId);
    await payCharge.mutateAsync({ chargeId, method: "cash" });
    setPayingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Users", href: ROUTES.manageUsers }, { label: patron.name }]} />

      <div className="flex items-center gap-4">
        <div className="size-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-body-lg">
          {initials(patron.name)}
        </div>
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{patron.name}</h1>
          <p className="text-body-md text-on-surface-variant">
            {patron.email} · {ROLE_LABELS[patron.role]}
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Outstanding charges</h2>
        {history && history.charges.filter((c) => c.status === "unpaid").length > 0 ? (
          <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {history.charges
              .filter((c) => c.status === "unpaid")
              .map((charge) => (
                <div key={charge.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-body-md text-on-surface capitalize">{charge.type.replace(/_/g, " ")}</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">
                      {charge.bookTitle ?? "—"} · {formatDate(charge.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-body-md text-on-surface">{formatCurrency(charge.amount)}</span>
                    <button
                      onClick={() => handleRecordCash(charge.id)}
                      disabled={payCharge.isPending && payingId === charge.id}
                      className="rounded-md bg-primary text-on-primary text-label-sm font-label-sm px-3 py-1.5 disabled:opacity-60"
                    >
                      {payCharge.isPending && payingId === charge.id ? "Recording…" : "Record cash payment"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState icon="check_circle" title="No outstanding charges" />
        )}
      </div>

      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Loan history</h2>
        {history && history.loans.length > 0 ? (
          <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {history.loans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between px-4 py-3">
                <p className="text-body-md text-on-surface">{loan.bookTitle}</p>
                <StatusBadge status={loan.loanState} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="menu_book" title="No loan history" />
        )}
      </div>
    </div>
  );
}
