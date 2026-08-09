import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="min-h-full paper-texture flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="font-headline-lg text-headline-lg text-primary mb-2">404</p>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Page not found</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href={ROUTES.catalogue}
          className="inline-block rounded-lg bg-primary text-on-primary font-label-md text-label-md px-5 py-2.5 hover:bg-primary/90 transition-colors"
        >
          Back to catalogue
        </Link>
      </div>
    </div>
  );
}
