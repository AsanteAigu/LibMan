"use client";

import Link from "next/link";
import { useState } from "react";
import { useUsers } from "@/features/admin/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { SearchBar } from "@/components/shared/search-bar";
import { ROLE_LABELS } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/format";
import type { User } from "@/types/user";

export default function ManageUsersPage() {
  const [q, setQ] = useState("");
  const { data: users, isLoading } = useUsers({ q });

  const columns: DataTableColumn<User>[] = [
    { key: "name", header: "Name", render: (u) => u.name, sortValue: (u) => u.name },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "role", header: "Role", render: (u) => ROLE_LABELS[u.role] },
    { key: "createdAt", header: "Joined", render: (u) => formatDate(u.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Users</h1>
        <p className="text-body-md text-on-surface-variant">Search patrons and view their history</p>
      </div>
      <div className="max-w-sm">
        <SearchBar placeholder="Search by name or email" onSearch={setQ} />
      </div>
      <DataTable
        columns={columns}
        data={users ?? []}
        getRowId={(u) => u.id}
        isLoading={isLoading}
        emptyTitle="No users found"
        rowActions={(u) => (
          <Link href={ROUTES.userLookup(u.id)} className="text-label-sm font-label-sm text-primary hover:underline">
            View history
          </Link>
        )}
      />
    </div>
  );
}
