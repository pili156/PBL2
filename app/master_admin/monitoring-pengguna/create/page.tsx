import { Save } from "lucide-react";
import BackLink from "@/app/components/BackLink";
import { createUser } from '../actions';
import { prisma } from "@/src/lib/prisma";

export const dynamic = 'force-dynamic';

function formatRoleName(name: string | null): string {
  if (!name) return '';
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function CreateUserPage() {
  const roles = await prisma.masterRole.findMany({
    orderBy: { id: 'asc' },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <BackLink href="/master_admin/monitoring-pengguna" />
        <div className="h-5 w-px bg-slate-200" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tambah Pengguna Baru</h2>
          <p className="text-sm text-slate-500 mt-0.5">Buat akun baru untuk pengguna sistem</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form action={createUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
            <input
              type="text"
              name="nama_lengkap"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="email@polines.ac.id"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Min. 8 karakter, 1 huruf kapital, 1 karakter unik"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">NIP</label>
              <input
                type="text"
                name="nip"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Nomor Induk Pegawai"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Role</label>
            <select
              name="role_id"
              defaultValue={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{formatRoleName(role.nama_role)}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            Tambah Pengguna
          </button>
        </form>
      </div>
    </div>
  );
}
