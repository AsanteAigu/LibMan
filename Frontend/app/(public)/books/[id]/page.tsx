"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useBook } from "@/features/catalogue/hooks";
import { useCreateBorrowRequest, useCreateReservation } from "@/features/loans/hooks";
import { useAuth } from "@/hooks/use-auth";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { StatusBadge } from "@/components/shared/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { DurationPickerDialog } from "@/components/shared/duration-picker-dialog";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/constants/routes";

export default function BookDetailPage({ params }: PageProps<"/books/[id]">) {
  const { id } = use(params);
  const { data: book, isLoading, isError } = useBook(id);
  const { user } = useAuth();
  const router = useRouter();
  const createRequest = useCreateBorrowRequest();
  const createReservation = useCreateReservation();
  const [pickingDuration, setPickingDuration] = useState(false);

  if (isLoading) {
    return <div className="animate-pulse h-96 rounded-lg bg-surface-container-high" />;
  }
  if (isError || !book) {
    return <ErrorState message="This title couldn't be found." />;
  }

  const available = book.availableCopies > 0;
  const isPending = createRequest.isPending || createReservation.isPending;

  const handleAction = () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    if (available) {
      setPickingDuration(true);
    } else {
      createReservation.mutate({ titleId: book.id });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: "Catalogue", href: ROUTES.catalogue }, { label: book.title }]} />
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        <div className="relative aspect-[3/4] w-full max-w-[280px] rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low flex items-center justify-center">
          {book.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-outline text-[48px]">menu_book</span>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
              {book.title}
            </h1>
            <p className="text-body-lg text-on-surface-variant">{book.author}</p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-label-md font-label-md text-on-surface-variant">
            <span>Replacement cost {formatCurrency(book.replacementCost)}</span>
            {book.hasEbook && <span>Ebook edition available</span>}
          </div>

          <div className="rounded-lg border border-outline-variant p-4">
            <p className="font-label-md text-label-md text-on-surface mb-3">
              {book.availableCopies} of {book.copies.length} copies available
            </p>
            <div className="flex flex-col gap-2">
              {book.copies.map((copy) => (
                <div key={copy.id} className="flex items-center justify-between text-body-md">
                  <span className="text-on-surface-variant">Shelf {copy.shelfLocation ?? "—"}</span>
                  <StatusBadge status={copy.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAction}
              disabled={isPending}
              className="rounded-lg bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isPending
                ? "Sending…"
                : available
                ? "Request to borrow"
                : "Join reservation queue"}
            </button>
            {!user && (
              <p className="text-label-sm font-label-sm text-on-surface-variant self-center">
                You&apos;ll need to sign in first.
              </p>
            )}
          </div>
        </div>
      </div>

      <DurationPickerDialog
        open={pickingDuration}
        onOpenChange={setPickingDuration}
        title="How long do you need this book?"
        description={`Choose how long you'd like to borrow "${book.title}" for, from 1 minute up to 30 days.`}
        confirmLabel="Request to borrow"
        isLoading={createRequest.isPending}
        onConfirm={(durationMinutes) => {
          createRequest.mutate(
            { titleId: book.id, durationMinutes },
            { onSuccess: () => setPickingDuration(false) }
          );
        }}
      />
    </div>
  );
}
