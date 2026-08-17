"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { STAFF_NAV_LINKS, activeStaffHref } from "./staff-nav-links";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Sidebar is desktop-only (hidden below lg) -- this is the mobile equivalent,
// a top bar that opens the same links in a slide-in drawer, so librarians on
// a phone can still reach pages like Active Loans to mark a hold collected.
export function StaffMobileNav() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const activeHref = activeStaffHref(pathname);
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-surface-container-low fixed top-0 left-0 right-0 z-40 flex lg:hidden items-center justify-between border-b border-outline-variant px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">local_library</span>
        <span className="font-headline-md text-headline-md font-bold text-primary">LibMan</span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <button
          onClick={() => setOpen(true)}
          className="size-9 flex items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <SheetContent side="left" className="bg-surface-container-low flex flex-col p-4 gap-2">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <span className="material-symbols-outlined text-primary">local_library</span>
            <span className="font-headline-md text-headline-md font-bold text-primary">LibMan</span>
          </div>
          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {STAFF_NAV_LINKS.map((link) => {
              const active = link.href === activeHref;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg font-label-md text-label-md transition-colors",
                    active
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign out
          </button>
        </SheetContent>
      </Sheet>
    </header>
  );
}
