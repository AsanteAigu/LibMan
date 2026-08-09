"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useStudentStats } from "@/features/admin/hooks";
import { useLoans } from "@/features/loans/hooks";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton, TableSkeleton } from "@/components/shared/skeletons";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ROUTES } from "@/constants/routes";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: loans, isLoading: loansLoading } = useLoans({ mine: true });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-body-md text-on-surface-variant">Here&apos;s what&apos;s happening with your account</p>
      </div>

      {statsLoading || !stats ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active loans" value={stats.activeLoans} icon="menu_book" />
          <StatCard label="Reserved books" value={stats.reservedBooks} icon="bookmark" />
          <StatCard
            label="Overdue books"
            value={stats.overdueBooks}
            icon="warning"
            tone={stats.overdueBooks > 0 ? "error" : "default"}
          />
          <StatCard
            label="Outstanding charges"
            value={formatCurrency(stats.outstandingCharges)}
            icon="receipt_long"
            tone={stats.outstandingCharges > 0 ? "warning" : "default"}
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline-md text-headline-md text-on-surface">Recently borrowed</h2>
          <Link href={ROUTES.loans} className="text-label-md font-label-md text-primary hover:underline">
            View all
          </Link>
        </div>
        {loansLoading ? (
          <TableSkeleton rows={3} />
        ) : loans && loans.length > 0 ? (
          <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {loans.slice(0, 5).map((loan) => (
              <div key={loan.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{loan.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Due {formatDate(loan.dueDate)}
                  </p>
                </div>
                <StatusBadge status={loan.loanState} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="menu_book" title="No loans yet" description="Browse the catalogue to get started." />
        )}
      </div>
    </div>
  );
}
