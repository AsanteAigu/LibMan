"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEbooks, useEbookLoans, useBorrowEbook } from "@/features/loans/hooks";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DurationPickerDialog } from "@/components/shared/duration-picker-dialog";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/constants/routes";

export default function EbookLibraryPage() {
  const { user } = useAuth();
  const { data: ebooks, isLoading } = useEbooks();
  const { data: myLoans } = useEbookLoans();
  const borrowEbook = useBorrowEbook();
  const [borrowing, setBorrowing] = useState<{ id: string; title: string } | null>(null);

  const isBorrowed = (ebookId: string) =>
    myLoans?.some((l) => l.ebookEditionId === ebookId && l.status !== "returned");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          Ebook Library
        </h1>
        <p className="text-body-md text-on-surface-variant">Borrow and read digital editions instantly</p>
      </div>

      {myLoans && myLoans.length > 0 && (
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Currently reading</h2>
          <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {myLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{loan.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Expires {formatDate(loan.loanExpiresAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={loan.status} />
                  <Link
                    href={ROUTES.ebookReader(loan.ebookEditionId)}
                    className="text-label-md font-label-md text-primary hover:underline"
                  >
                    Read
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Browse ebooks</h2>
        {isLoading ? (
          <CardGridSkeleton />
        ) : ebooks && ebooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="flex flex-col gap-2">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low flex items-center justify-center">
                  {ebook.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ebook.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-[32px]">auto_stories</span>
                  )}
                </div>
                <p className="font-headline-md text-body-md font-semibold text-on-surface leading-snug line-clamp-2">
                  {ebook.bookTitle}
                </p>
                <p className="text-label-md text-on-surface-variant">{ebook.author}</p>
                {isBorrowed(ebook.id) ? (
                  <Link
                    href={ROUTES.ebookReader(ebook.id)}
                    className="text-center rounded-lg border border-outline-variant text-label-md font-label-md text-on-surface py-1.5 hover:bg-surface-container-low transition-colors"
                  >
                    Continue reading
                  </Link>
                ) : (
                  <button
                    onClick={() => user && setBorrowing({ id: ebook.id, title: ebook.bookTitle })}
                    className="rounded-lg bg-primary text-on-primary text-label-md font-label-md py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    Borrow
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="auto_stories" title="No ebooks available" />
        )}
      </div>

      <DurationPickerDialog
        open={!!borrowing}
        onOpenChange={(open) => !open && setBorrowing(null)}
        title="How long do you need this ebook?"
        description={`Choose how long you'd like to borrow "${borrowing?.title ?? ""}" for, from 1 minute up to 30 days.`}
        confirmLabel="Borrow"
        isLoading={borrowEbook.isPending}
        onConfirm={(durationMinutes) => {
          if (!borrowing) return;
          borrowEbook.mutate(
            { ebookEditionId: borrowing.id, durationMinutes },
            { onSuccess: () => setBorrowing(null) }
          );
        }}
      />
    </div>
  );
}
