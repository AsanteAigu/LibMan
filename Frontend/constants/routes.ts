import type { UserRole } from "@/types/user";

export const ROUTES = {
  home: "/catalogue",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  unauthorized: "/unauthorized",

  catalogue: "/catalogue",
  search: "/search",
  bookDetail: (id: string) => `/books/${id}`,

  studentDashboard: "/dashboard",
  myRequests: "/my-requests",
  reservations: "/reservations",
  loans: "/loans",
  ebookLibrary: "/ebooks",
  ebookReader: (id: string) => `/ebooks/${id}/read`,
  charges: "/charges",
  notifications: "/notifications",
  profile: "/profile",
  pickupNotice: (id: string) => `/pickup-notice/${id}`,

  librarianDashboard: "/librarian",
  borrowRequests: "/librarian/borrow-requests",
  activeLoans: "/librarian/active-loans",
  catalogueManagement: "/librarian/catalogue-management",
  manageReservations: "/librarian/reservations",
  manageUsers: "/librarian/users",
  userLookup: (id: string) => `/librarian/users/${id}`,

  // Every user who can reach these is a librarian -- the backend's user_role
  // enum has no separate 'admin' value, so these live under the librarian
  // sidebar rather than a distinct admin-only section.
  manageLibrarians: "/admin/librarians",
  reports: "/admin/reports",
  settings: "/admin/settings",
} as const;

export function homeRouteForRole(role: UserRole): string {
  switch (role) {
    case "librarian":
    case "admin":
      return ROUTES.librarianDashboard;
    case "student":
      return ROUTES.studentDashboard;
    default:
      return ROUTES.catalogue;
  }
}
