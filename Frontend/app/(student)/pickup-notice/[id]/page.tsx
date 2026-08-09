"use client";

import { use } from "react";
import Link from "next/link";
import { useLoans } from "@/features/loans/hooks";
import { formatDateTime } from "@/lib/format";
import { ROUTES } from "@/constants/routes";
import { ErrorState } from "@/components/shared/error-state";

export default function PickupNoticePage({ params }: PageProps<"/pickup-notice/[id]">) {
  const { id } = use(params);
  const { data: loans, isLoading } = useLoans({ mine: true });
  const loan = loans?.find((l) => l.id === id);

  if (isLoading) return <div className="animate-pulse h-72 rounded-lg bg-surface-container-high" />;
  if (!loan) return <ErrorState message="This hold notice couldn't be found." />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center">
        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[40px] mb-3">
          local_library
        </span>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-1">Ready for pickup</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          Bring your library ID to the front desk to collect this title.
        </p>
        <div className="rounded-lg bg-surface-container-low p-5 text-left mb-6 flex flex-col gap-2">
          <p className="font-headline-md text-body-lg text-on-surface">{loan.bookTitle}</p>
          <p className="text-body-md text-on-surface-variant">Shelf {loan.shelfLocation ?? "—"}</p>
          {loan.holdExpiresAt && (
            <p className="text-label-md font-label-md text-error">
              Hold expires {formatDateTime(loan.holdExpiresAt)}
            </p>
          )}
        </div>
        <Link
          href={ROUTES.loans}
          className="inline-block rounded-lg bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          View my loans
        </Link>
      </div>
    </div>
  );
}
