import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="size-9 flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "size-9 flex items-center justify-center rounded-md text-label-md font-label-md",
            p === page
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-high"
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className="size-9 flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </nav>
  );
}
