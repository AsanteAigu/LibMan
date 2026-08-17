"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { STAFF_NAV_LINKS, activeStaffHref } from "./staff-nav-links";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const activeHref = activeStaffHref(pathname);

  return (
    <nav className="bg-surface-container-low h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col border-r border-outline-variant p-4 gap-2 z-40">
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <span className="material-symbols-outlined text-primary">local_library</span>
        <span className="font-headline-md text-headline-md font-bold text-primary">LibMan</span>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {STAFF_NAV_LINKS.map((link) => {
          const active = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
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
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">logout</span>
        Sign out
      </button>
    </nav>
  );
}
