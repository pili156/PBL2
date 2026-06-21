"use client";

import { Search, SlidersHorizontal } from "lucide-react";

interface FilterOption {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (v: string) => void;
  filters?: FilterOption[];
}

export default function FilterBar({
  searchPlaceholder = "Cari nama, NIP, atau jurusan...",
  searchValue,
  onSearchChange,
  filters = [],
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-[7px] bg-white flex-1 min-w-[200px]">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full bg-transparent"
        />
      </div>

      {filters.map((f) => (
        <div key={f.label} className="flex flex-col gap-1">
          <label className="text-[11px] text-gray-400 font-medium">{f.label}</label>
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-[6px] text-sm text-gray-700 bg-white appearance-none pr-7 bg-no-repeat outline-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 8px center",
            }}
          >
            {f.options.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3.5 py-[7px] text-sm text-gray-600 bg-white hover:border-gray-300 transition-colors">
        <SlidersHorizontal size={13} />
        Filter
      </button>
    </div>
  );
}
