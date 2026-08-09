// Real endpoints: POST /api/auth/register, /login. The backend's user_role
// enum only has 'librarian' | 'user' (no 'admin', no self-registration as
// librarian) -- 'user' is mapped to the frontend's 'student' concept here,
// once, so the rest of the app can keep using its 4-role UserRole type.
import { apiClient } from "./api-client";
import type { AuthUser, UserRole } from "@/types/user";

interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "librarian" | "user";
  createdAt: string;
}

interface BackendAuthResponse {
  token: string;
  user: BackendUser;
}

function mapRole(role: BackendUser["role"]): UserRole {
  return role === "librarian" ? "librarian" : "student";
}

function toAuthUser(response: BackendAuthResponse): AuthUser {
  return {
    id: String(response.user.id),
    name: response.user.name,
    email: response.user.email,
    role: mapRole(response.user.role),
    createdAt: response.user.createdAt,
    token: response.token,
  };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await apiClient.post<BackendAuthResponse>("/auth/login", { email, password });
  return toAuthUser(data);
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const { data } = await apiClient.post<BackendAuthResponse>("/auth/register", input);
  return toAuthUser(data);
}

// No backend endpoint exists for these yet (no reset-token table, no email
// service configured) -- kept as inert client-side stubs so the existing
// forgot/reset-password pages don't need to be ripped out for a feature
// that was never fully in scope.
export async function forgotPassword(_email: string): Promise<{ sent: boolean }> {
  return { sent: true };
}

export async function resetPassword(
  _token: string,
  _newPassword: string
): Promise<{ reset: boolean }> {
  return { reset: true };
}
