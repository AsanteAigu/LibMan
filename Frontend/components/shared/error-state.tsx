export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border border-error-container bg-error-container/30">
      <span className="material-symbols-outlined text-error text-[40px] mb-3">error</span>
      <p className="font-headline-md text-headline-md text-on-surface mb-1">Couldn&apos;t load this</p>
      <p className="text-body-md text-on-surface-variant max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary text-on-primary font-label-md text-label-md px-4 py-2 hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
