export type UserRole = "guest" | "student" | "librarian" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthUser extends User {
  token: string;
}
