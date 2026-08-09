"use client";

import { useReports } from "@/features/admin/hooks";
import { MiniBarChart } from "@/components/shared/mini-bar-chart";
import { StatCardsSkeleton } from "@/components/shared/skeletons";

export default function ReportsPage() {
  const { data: reports, isLoading } = useReports();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Reports</h1>
        <p className="text-body-md text-on-surface-variant">Circulation and revenue trends</p>
      </div>

      {isLoading ? (
        <StatCardsSkeleton count={2} />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {reports?.map((report) => (
            <div key={report.id} className="rounded-lg border border-outline-variant p-5">
              <p className="font-headline-md text-body-lg text-on-surface mb-1">{report.title}</p>
              <p className="text-label-sm font-label-sm text-on-surface-variant mb-4">{report.description}</p>
              <MiniBarChart data={report.data} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
