"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types/user";
import * as authService from "@/services/auth";
import { ROUTES } from "@/constants/routes";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "libman_user";
const TOKEN_KEY = "libman_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Reading localStorage can only happen client-side, so this bootstraps auth
    // state after mount (matches the server-rendered "guest" pass, no hydration
    // mismatch) rather than syncing an external store on every render.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((authUser: AuthUser) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    window.localStorage.setItem(TOKEN_KEY, authUser.token);
    setUser(authUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const authUser = await authService.login(email, password);
      persist(authUser);
      return authUser;
    },
    [persist]
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const authUser = await authService.register(input);
      persist(authUser);
      return authUser;
    },
    [persist]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push(ROUTES.login);
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
