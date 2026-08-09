"use client";

import { useState } from "react";
import { useUsers } from "@/features/admin/hooks";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { SearchBar } from "@/components/shared/search-bar";
import { formatDate } from "@/lib/format";
import type { User } from "@/types/user";

export default function ManageLibrariansPage() {
  const [q, setQ] = useState("");
  const { data: librarians, isLoading } = useUsers({ role: "librarian", q });

  const columns: DataTableColumn<User>[] = [
    { key: "name", header: "Name", render: (u) => u.name, sortValue: (u) => u.name },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "createdAt", header: "Joined", render: (u) => formatDate(u.createdAt) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Librarians</h1>
        <p className="text-body-md text-on-surface-variant">Staff with circulation and inventory access</p>
      </div>
      <div className="max-w-sm">
        <SearchBar placeholder="Search librarians" onSearch={setQ} />
      </div>
      <DataTable
        columns={columns}
        data={librarians ?? []}
        getRowId={(u) => u.id}
        isLoading={isLoading}
        emptyTitle="No librarians found"
      />
    </div>
  );
}
