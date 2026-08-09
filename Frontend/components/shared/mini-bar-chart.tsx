export function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-3 h-32">
      {data.map((point) => (
        <div key={point.label} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full flex items-end h-24 rounded-t-md bg-surface-container-low overflow-hidden">
            <div
              className="w-full bg-primary rounded-t-md transition-all"
              style={{ height: `${(point.value / max) * 100}%` }}
            />
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
