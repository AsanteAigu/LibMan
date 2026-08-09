"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { initials } from "@/lib/format";

export function ProfileMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center size-9 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
        {initials(user.name)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="font-label-md text-label-md text-on-surface">{user.name}</p>
          <p className="text-label-sm text-on-surface-variant">{ROLE_LABELS[user.role]}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={ROUTES.profile} />}>Profile</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.notifications} />}>Notifications</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} variant="destructive">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
