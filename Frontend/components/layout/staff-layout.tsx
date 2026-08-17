import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { StaffMobileNav } from "./staff-mobile-nav";

export function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <Sidebar />
      <StaffMobileNav />
      <main className="pt-14 lg:pt-0 lg:pl-64">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
