"use client";

import { useMemo, useState, type ReactNode } from "react";
import { TableSkeleton } from "./skeletons";
import { EmptyState } from "./empty-state";
import { Pagination } from "./pagination";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  pageSize = 10,
  rowActions,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  rowActions?: (row: T) => ReactNode;
}) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return data;
    return [...data].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [data, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) return <TableSkeleton />;
  if (data.length === 0) {
    return <EmptyState icon="table_rows" title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3 font-label-sm text-label-sm font-bold text-on-surface-variant whitespace-nowrap",
                    column.align === "right" && "text-right"
                  )}
                >
                  {column.sortValue ? (
                    <button
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() =>
                        setSort((prev) =>
                          prev?.key === column.key
                            ? { key: column.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                            : { key: column.key, dir: "asc" }
                        )
                      }
                    >
                      {column.header}
                      <span className="material-symbols-outlined text-[16px]">
                        {sort?.key === column.key
                          ? sort.dir === "asc"
                            ? "arrow_upward"
                            : "arrow_downward"
                          : "unfold_more"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
              {rowActions && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {paged.map((row) => (
              <tr key={getRowId(row)} className="hover:bg-surface-container-low/60 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-body-md text-on-surface",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right">{rowActions(row)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
