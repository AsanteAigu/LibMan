"use client";

import { useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { useCharges, usePayments, usePayCharge } from "@/features/billing/hooks";
import { useAuth } from "@/hooks/use-auth";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency, formatDate } from "@/lib/format";
import { openPaystackCheckout } from "@/lib/paystack";
import type { Charge } from "@/types/billing";

export default function ChargesPage() {
  const { user } = useAuth();
  const { data: charges, isLoading } = useCharges({ mine: true });
  const { data: payments } = usePayments({ mine: true });
  const payCharge = usePayCharge();
  const [payingId, setPayingId] = useState<string | null>(null);

  const outstanding = charges?.filter((c) => c.status === "unpaid").reduce((s, c) => s + c.amount, 0) ?? 0;

  const columns: DataTableColumn<Charge>[] = [
    { key: "bookTitle", header: "Title", render: (c) => c.bookTitle ?? "—" },
    { key: "type", header: "Reason", render: (c) => c.type.replace(/_/g, " ") },
    { key: "amount", header: "Amount", render: (c) => formatCurrency(c.amount), align: "right" },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "createdAt", header: "Date", render: (c) => formatDate(c.createdAt) },
  ];

  const handlePay = (charge: Charge) => {
    if (!user) return;
    setPayingId(charge.id);
    try {
      openPaystackCheckout({
        email: user.email,
        amountGHS: charge.amount,
        onSuccess: (reference) => {
          payCharge.mutate(
            { chargeId: charge.id, method: "paystack", reference },
            { onSettled: () => setPayingId(null) }
          );
        },
        onClose: () => setPayingId(null),
      });
    } catch {
      toast.error("Couldn't open the payment window. Please try again.");
      setPayingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          Charges &amp; Payments
        </h1>
        <p className="text-body-md text-on-surface-variant">Fines, damage charges, and your payment history</p>
      </div>

      <div className="max-w-xs">
        <StatCard
          label="Outstanding balance"
          value={formatCurrency(outstanding)}
          icon="account_balance_wallet"
          tone={outstanding > 0 ? "warning" : "default"}
        />
      </div>

      <DataTable
        columns={columns}
        data={charges ?? []}
        getRowId={(c) => c.id}
        isLoading={isLoading}
        emptyTitle="No charges"
        emptyDescription="Any late fees or damage charges will appear here."
        rowActions={(c) =>
          c.status === "unpaid" ? (
            <button
              onClick={() => handlePay(c)}
              disabled={payingId === c.id}
              className="rounded-md bg-primary text-on-primary text-label-sm font-label-sm px-3 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {payingId === c.id ? "Paying…" : "Pay now"}
            </button>
          ) : null
        }
      />

      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      {payments && payments.length > 0 && (
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Payment history</h2>
          <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-4 py-3 text-body-md">
                <span className="text-on-surface-variant capitalize">{payment.method}</span>
                <span className="text-on-surface">{formatCurrency(payment.amount)}</span>
                <span className="text-on-surface-variant">{formatDate(payment.paidAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
