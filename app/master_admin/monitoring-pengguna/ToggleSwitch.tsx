"use client";

import { useRouter } from "next/navigation";

export default function ToggleSwitch({
  userId,
  currentStatus,
}: {
  userId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const isActive = currentStatus === "aktif";

  const handleToggle = async () => {
    const form = new FormData();
    form.append("id", String(userId));
    await fetch("/master_admin/monitoring-pengguna/toggle-status", {
      method: "POST",
      body: form,
    });
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        isActive ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
          isActive ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
