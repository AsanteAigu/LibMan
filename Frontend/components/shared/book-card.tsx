import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import type { Book } from "@/types/book";

export function BookCard({ book }: { book: Book }) {
  const available = book.availableCopies > 0;

  return (
    <Link href={ROUTES.bookDetail(book.id)} className="group flex flex-col gap-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
        {book.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-outline text-[32px]">menu_book</span>
          </div>
        )}
        <span
          className={
            "absolute top-2 right-2 rounded-full px-2 py-0.5 text-label-sm font-label-sm " +
            (available
              ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
              : "bg-error-container text-on-error-container")
          }
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>
      <div>
        <p className="font-headline-md text-body-md font-semibold text-on-surface leading-snug line-clamp-2">
          {book.title}
        </p>
        <p className="text-label-md text-on-surface-variant">{book.author}</p>
      </div>
    </Link>
  );
}
