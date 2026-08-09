import type { ReactNode } from "react";
import { PatronLayout } from "@/components/layout/patron-layout";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <PatronLayout>{children}</PatronLayout>;
}
