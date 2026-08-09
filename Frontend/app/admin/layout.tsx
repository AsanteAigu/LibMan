import type { ReactNode } from "react";
import { StaffLayout } from "@/components/layout/staff-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allow={["librarian"]}>
      <StaffLayout>{children}</StaffLayout>
    </ProtectedRoute>
  );
}
