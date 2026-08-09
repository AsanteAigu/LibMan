import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full paper-texture flex items-center justify-center p-4">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-8 sm:p-10">{children}</div>
      </main>
    </div>
  );
}
