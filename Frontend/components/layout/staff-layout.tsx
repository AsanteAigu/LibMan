import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
