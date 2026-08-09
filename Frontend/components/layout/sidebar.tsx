"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// Every user who reaches this layout is a librarian -- the backend's
// user_role enum has no separate 'admin' value, so there's one unified
// staff nav rather than a role-branched admin/librarian split.
const LINKS = [
  { href: ROUTES.librarianDashboard, label: "Dashboard", icon: "space_dashboard" },
  { href: ROUTES.borrowRequests, label: "Borrow Requests", icon: "assignment" },
  { href: ROUTES.activeLoans, label: "Active Loans", icon: "menu_book" },
  { href: ROUTES.manageReservations, label: "Reservations", icon: "bookmark" },
  { href: ROUTES.catalogueManagement, label: "Manage Catalogue", icon: "inventory_2" },
  { href: ROUTES.manageUsers, label: "Users", icon: "group" },
  { href: ROUTES.manageLibrarians, label: "Librarians", icon: "badge" },
  { href: ROUTES.reports, label: "Reports", icon: "monitoring" },
  { href: ROUTES.settings, label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  // Pick the single longest href that matches the current path (exact, or a
  // path segment prefix) so a parent route like "/librarian" doesn't also
  // light up on every child route like "/librarian/users".
  const activeHref = LINKS.map((link) => link.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav className="bg-surface-container-low h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col border-r border-outline-variant p-4 gap-2 z-40">
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <span className="material-symbols-outlined text-primary">local_library</span>
        <span className="font-headline-md text-headline-md font-bold text-primary">LibMan</span>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {LINKS.map((link) => {
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
