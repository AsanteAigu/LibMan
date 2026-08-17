import { ROUTES } from "@/constants/routes";

// Every user who reaches the staff layout is a librarian -- the backend's
// user_role enum has no separate 'admin' value, so there's one unified
// staff nav rather than a role-branched admin/librarian split.
export const STAFF_NAV_LINKS = [
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

// Picks the single longest href that matches the current path (exact, or a
// path segment prefix) so a parent route like "/librarian" doesn't also
// light up on every child route like "/librarian/users".
export function activeStaffHref(pathname: string): string | undefined {
  return STAFF_NAV_LINKS.map((link) => link.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}
