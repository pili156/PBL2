import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
    >
      <ArrowLeft size={18} /> Kembali
    </Link>
  );
}
