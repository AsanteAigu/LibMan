import type { ReactNode } from "react";
import { StaffLayout } from "@/components/layout/staff-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function LibrarianLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allow={["librarian", "admin"]}>
      <StaffLayout>{children}</StaffLayout>
    </ProtectedRoute>
  );
}
