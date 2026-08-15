"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useStudentStats } from "@/features/admin/hooks";
import { useLoans, useEbookLoans, useReservations, useBorrowRequests } from "@/features/loans/hooks";
import { useCharges } from "@/features/billing/hooks";
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
  const { data: ebookLoans, isLoading: ebookLoansLoading } = useEbookLoans();
  const { data: reservations, isLoading: reservationsLoading } = useReservations({ mine: true });
  const { data: requests, isLoading: requestsLoading } = useBorrowRequests({ mine: true });
  const { data: charges, isLoading: chargesLoading } = useCharges({ mine: true });

  const currentlyReading = ebookLoans?.filter((l) => l.status === "active" || l.status === "grace") ?? [];
  const activeReservations = reservations?.filter((r) => r.status === "waiting" || r.status === "notified") ?? [];
  const pendingRequests = requests?.filter((r) => r.status === "pending") ?? [];
  const unpaidCharges = charges?.filter((c) => c.status === "unpaid") ?? [];

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

      <DashboardSection title="Currently reading" viewAllHref={ROUTES.ebookLibrary} isLoading={ebookLoansLoading}>
        {currentlyReading.length > 0 ? (
          <RowList>
            {currentlyReading.slice(0, 5).map((loan) => (
              <Row key={loan.id}>
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{loan.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    {loan.status === "grace" ? "Reading time ended" : `Expires ${formatDate(loan.loanExpiresAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={loan.status} />
                  <Link
                    href={loan.status === "grace" ? ROUTES.charges : ROUTES.ebookReader(loan.ebookEditionId)}
                    className="text-label-md font-label-md text-primary hover:underline"
                  >
                    {loan.status === "grace" ? "Pay to continue" : "Read"}
                  </Link>
                </div>
              </Row>
            ))}
          </RowList>
        ) : (
          <EmptyState icon="auto_stories" title="No ebooks borrowed" description="Browse the ebook library to start reading." />
        )}
      </DashboardSection>

      <DashboardSection title="Recently borrowed" viewAllHref={ROUTES.loans} isLoading={loansLoading}>
        {loans && loans.length > 0 ? (
          <RowList>
            {loans.slice(0, 5).map((loan) => (
              <Row key={loan.id}>
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{loan.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Due {formatDate(loan.dueDate)}
                  </p>
                </div>
                <StatusBadge status={loan.loanState} />
              </Row>
            ))}
          </RowList>
        ) : (
          <EmptyState icon="menu_book" title="No loans yet" description="Browse the catalogue to get started." />
        )}
      </DashboardSection>

      <DashboardSection title="Reserved books" viewAllHref={ROUTES.reservations} isLoading={reservationsLoading}>
        {activeReservations.length > 0 ? (
          <RowList>
            {activeReservations.slice(0, 5).map((r) => (
              <Row key={r.id}>
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{r.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Position {r.queuePosition} in queue
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </Row>
            ))}
          </RowList>
        ) : (
          <EmptyState icon="bookmark" title="No reservations" description="Reserve a title that's currently unavailable to join the queue." />
        )}
      </DashboardSection>

      <DashboardSection title="Requested books" viewAllHref={ROUTES.myRequests} isLoading={requestsLoading}>
        {pendingRequests.length > 0 ? (
          <RowList>
            {pendingRequests.slice(0, 5).map((r) => (
              <Row key={r.id}>
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{r.bookTitle}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">
                    Requested {formatDate(r.requestedAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </Row>
            ))}
          </RowList>
        ) : (
          <EmptyState icon="pending_actions" title="No pending requests" description="Request a book from its detail page to see it here." />
        )}
      </DashboardSection>

      <DashboardSection title="Debts yet to be settled" viewAllHref={ROUTES.charges} isLoading={chargesLoading}>
        {unpaidCharges.length > 0 ? (
          <RowList>
            {unpaidCharges.slice(0, 5).map((c) => (
              <Row key={c.id}>
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{c.bookTitle ?? c.type.replace(/_/g, " ")}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">{formatDate(c.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body-md text-on-surface">{formatCurrency(c.amount)}</span>
                  <Link href={ROUTES.charges} className="text-label-md font-label-md text-primary hover:underline">
                    Pay now
                  </Link>
                </div>
              </Row>
            ))}
          </RowList>
        ) : (
          <EmptyState icon="check_circle" title="You're all settled up" description="No outstanding charges on your account." />
        )}
      </DashboardSection>
    </div>
  );
}

function DashboardSection({
  title,
  viewAllHref,
  isLoading,
  children,
}: {
  title: string;
  viewAllHref: string;
  isLoading: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
        <Link href={viewAllHref} className="text-label-md font-label-md text-primary hover:underline">
          View all
        </Link>
      </div>
      {isLoading ? <TableSkeleton rows={3} /> : children}
    </div>
  );
}

function RowList({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant">
      {children}
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between px-4 py-3">{children}</div>;
}
