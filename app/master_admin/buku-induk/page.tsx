import type { Metadata } from "next";
import BukuIndukClient from "@/components/buku-induk/BukuIndukClient";

export const metadata: Metadata = {
  title: "Buku Induk | SIGAP",
  description: "Master data akademik dosen Politeknik Negeri Semarang",
};

export default function BukuIndukPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <BukuIndukClient apiUrl="/api/master_admin/buku-induk" />
    </main>
  );
}
