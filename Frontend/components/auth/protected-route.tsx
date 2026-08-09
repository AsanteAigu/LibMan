"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import type { UserRole } from "@/types/user";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: UserRole[];
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(ROUTES.login);
      return;
    }
    if (allow && !allow.includes(user.role)) {
      router.replace(ROUTES.unauthorized);
    }
  }, [user, isLoading, allow, router]);

  if (isLoading || !user || (allow && !allow.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
