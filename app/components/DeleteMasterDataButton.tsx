"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteMasterDataButtonProps {
  apiPath: string;
  id: number;
  label: string;
}

export default function DeleteMasterDataButton({ apiPath, id, label }: DeleteMasterDataButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Hapus ${label} ini? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus data.");
      }
      router.refresh();
      alert(`${label} berhasil dihapus.`);
    } catch (error: any) {
      window.alert(error.message || "Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      <Trash2 size={16} />
      {isDeleting ? "Menghapus..." : "Hapus"}
    </button>
  );
}
