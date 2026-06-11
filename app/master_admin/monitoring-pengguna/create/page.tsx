import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { Save, UserPlus } from "lucide-react";
import BackLink from "@/app/components/BackLink";
import Link from "next/link";
import { createUser } from '../actions';

export const dynamic = 'force-dynamic';

const ROLE_OPTIONS = [
  { id: 1, name: 'Master Admin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Dosen' },
  { id: 4, name: 'Keuangan' },
];

export default async function CreateUserPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <BackLink href="/master_admin/monitoring-pengguna" />
        <div className="h-5 w-px bg-slate-200" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tambah Pengguna Baru</h2>
          <p className="text-sm text-slate-500 mt-0.5">Buat akun baru untuk dosen, admin, atau keuangan</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <form action={createUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                name="nama_lengkap"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Nama lengkap"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">NIP</label>
              <input
                type="text"
                name="nip"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="NIP (opsional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="email@polines.ac.id"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Username</label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Role</label>
              <select
                name="role_id"
                defaultValue={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                {ROLE_OPTIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Jurusan</label>
            <input
              type="text"
              name="jurusan"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Jurusan (opsional)"
            />
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
