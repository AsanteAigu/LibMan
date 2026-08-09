import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { BottomNav } from "./bottom-nav";

export function PatronLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full flex flex-col paper-texture">
      <Navbar />
      <main className="flex-1 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-base pb-24 lg:pb-base">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
