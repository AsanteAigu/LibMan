"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const TABS = [
  { href: ROUTES.catalogue, label: "Home", icon: "home" },
  { href: ROUTES.loans, label: "Loans", icon: "menu_book" },
  { href: ROUTES.reservations, label: "Holds", icon: "bookmark" },
  { href: ROUTES.notifications, label: "Alerts", icon: "notifications" },
  { href: ROUTES.profile, label: "Profile", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface fixed bottom-0 w-full lg:hidden z-50 border-t border-outline-variant shadow-lg">
      <div className="flex justify-around items-center px-4 py-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-label-sm font-label-sm",
                active ? "text-primary" : "text-on-surface-variant"
              )}
            >
              <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
