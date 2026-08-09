"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { ProfileMenu } from "@/components/shared/profile-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: ROUTES.catalogue, label: "Catalog" },
  { href: ROUTES.loans, label: "My Loans" },
  { href: ROUTES.reservations, label: "Reservations" },
  { href: ROUTES.ebookLibrary, label: "Ebooks" },
  { href: ROUTES.charges, label: "Charges" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md sticky top-0 z-40 border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-base max-w-container-max mx-auto">
        <Link href={ROUTES.catalogue} className="font-headline-md text-headline-md font-bold text-primary">
          LibMan
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-label-md text-label-md transition-colors pb-1",
                pathname === link.href
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <ProfileMenu />
          ) : (
            <Link
              href={ROUTES.login}
              className="rounded-lg bg-primary text-on-primary font-label-md text-label-md px-4 py-2 hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
