import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="text-center">
      <span className="material-symbols-outlined text-error text-[40px] mb-3">block</span>
      <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Access denied</h1>
      <p className="text-body-md text-on-surface-variant mb-6">
        Your account doesn&apos;t have permission to view that page.
      </p>
      <Link href={ROUTES.catalogue} className="text-primary hover:underline font-label-md text-label-md">
        Back to catalogue
      </Link>
    </div>
  );
}
