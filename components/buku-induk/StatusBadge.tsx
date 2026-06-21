import type { StatusDosen } from "@/src/types/buku-induk";

const statusStyles: Record<StatusDosen, string> = {
  Aktif: "bg-emerald-100 text-emerald-700",
  Selesai: "bg-indigo-100 text-indigo-700",
  Lulus: "bg-blue-100 text-blue-700",
  DO: "bg-red-100 text-red-600",
  Pensiun: "bg-orange-100 text-orange-600",
};

interface StatusBadgeProps {
  status: StatusDosen;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
