"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ userId }: { userId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    await fetch("/master_admin/monitoring-pengguna/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    router.push("/master_admin/monitoring-pengguna");
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  );
}
