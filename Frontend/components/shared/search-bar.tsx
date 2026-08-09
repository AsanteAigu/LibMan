"use client";

import { useState } from "react";

export function SearchBar({
  defaultValue = "",
  placeholder = "Search by title or author",
  onSearch,
}: {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
      className="relative w-full"
    >
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-outline-variant bg-surface-container-low pl-10 pr-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        aria-label={placeholder}
      />
    </form>
  );
}
