import type { UserRole } from "@/types/user";

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: "Guest",
  student: "Student",
  librarian: "Librarian",
  admin: "Administrator",
};

export const STAFF_ROLES: UserRole[] = ["librarian", "admin"];
export const PATRON_ROLES: UserRole[] = ["student"];
