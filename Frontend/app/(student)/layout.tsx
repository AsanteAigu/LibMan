import type { ReactNode } from "react";
import { PatronLayout } from "@/components/layout/patron-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allow={["student"]}>
      <PatronLayout>{children}</PatronLayout>
    </ProtectedRoute>
  );
}
