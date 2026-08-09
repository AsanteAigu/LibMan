"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooks } from "@/features/catalogue/hooks";
import { SearchBar } from "@/components/shared/search-bar";
import { BookCard } from "@/components/shared/book-card";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";

function CatalogueContent({ heading, subheading }: { heading: string; subheading: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [available, setAvailable] = useState(false);

  const { data: books, isLoading, isError, refetch } = useBooks({ q, availableOnly: available });

  const applySearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value);
    else params.delete("q");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          {heading}
        </h1>
        <p className="text-body-md text-on-surface-variant">{subheading}</p>
      </div>

      <SearchBar defaultValue={q} onSearch={applySearch} />

      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-label-md font-label-md border border-outline-variant text-on-surface-variant cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={(e) => setAvailable(e.target.checked)}
            className="accent-primary"
          />
          Available now
        </label>
      </div>

      {isLoading && <CardGridSkeleton />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && books?.length === 0 && (
        <EmptyState
          icon="search_off"
          title="No books found"
          description="Try a different search term or clear your filters."
        />
      )}
      {!isLoading && !isError && books && books.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CatalogueView({ heading, subheading }: { heading: string; subheading: string }) {
  return (
    <Suspense fallback={<CardGridSkeleton />}>
      <CatalogueContent heading={heading} subheading={subheading} />
    </Suspense>
  );
}
