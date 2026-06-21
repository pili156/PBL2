import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';
import { Plus, Edit3 } from 'lucide-react';
import DeleteMasterDataButton from '@/app/components/DeleteMasterDataButton';

export const dynamic = 'force-dynamic';

export default async function MasterPangkatPage() {
  const masterPangkat = await prisma.masterPangkat.findMany({ orderBy: { golongan: 'asc' } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Master Pangkat</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola daftar pangkat dan golongan.</p>
        </div>
        <Link
          href="/master_admin/master-pangkat/create"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Tambah Pangkat
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Pangkat</th>
              <th className="px-6 py-4">Golongan</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {masterPangkat.map((pangkat, index) => (
              <tr key={pangkat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{index + 1}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{pangkat.pangkat}</td>
                <td className="px-6 py-4">{pangkat.golongan}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/master_admin/master-pangkat/edit/${pangkat.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 size={16} /> Edit
                    </Link>
                    <DeleteMasterDataButton apiPath="/api/master-pangkat" id={pangkat.id} label="Pangkat" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
