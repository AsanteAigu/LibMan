"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TABS = [
  { href: ROUTES.catalogue, label: "Home", icon: "home" },
  { href: ROUTES.ebookLibrary, label: "Ebooks", icon: "auto_stories" },
  { href: ROUTES.loans, label: "Loans", icon: "menu_book" },
  { href: ROUTES.reservations, label: "Holds", icon: "bookmark" },
  { href: ROUTES.charges, label: "Charges", icon: "payments" },
  { href: ROUTES.notifications, label: "Alerts", icon: "notifications" },
  { href: ROUTES.profile, label: "Profile", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface fixed bottom-0 w-full lg:hidden z-50 border-t border-outline-variant shadow-lg">
      <div className="flex justify-between items-center px-0.5 py-1.5">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-md py-0.5 text-[9px] font-label-sm leading-tight",
                active ? "text-primary" : "text-on-surface-variant"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
