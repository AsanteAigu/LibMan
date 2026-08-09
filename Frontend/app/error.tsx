"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-full paper-texture flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <span className="material-symbols-outlined text-error text-[40px] mb-3">error</span>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
          Something went wrong
        </h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          An unexpected error occurred. You can try again.
        </p>
        <button
          onClick={reset}
          className="inline-block rounded-lg bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
