import { prisma } from '@/src/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import {
  User, Shield, KeyRound, Save,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import BackLink from '@/app/components/BackLink';
import { revalidatePath } from 'next/cache';
import { updateUserById, resetPassword } from '../actions';
import DeleteUserButton from './DeleteUserButton';
import ToggleSwitch from '../ToggleSwitch';
import { formatDateTime } from '@/src/lib/formatters';

export const dynamic = 'force-dynamic';

const ROLE_OPTIONS = [
  { id: 1, name: 'Master Admin' },
  { id: 2, name: 'Admin' },
  { id: 3, name: 'Dosen' },
  { id: 4, name: 'Keuangan' },
];

async function updateUserAction(formData: FormData) {
  'use server';
  await updateUserById(formData);
  redirect('/master_admin/monitoring-pengguna');
}

async function resetPasswordAction(formData: FormData) {
  'use server';
  await resetPassword(formData);
  revalidatePath('/master_admin/monitoring-pengguna');
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      master_dosen: true,
      role: true,
      activity_logs: { orderBy: { created_at: 'desc' }, take: 20 },
    },
  });

  if (!user) notFound();

  const roleName = (roleId: number | null) => {
    const map: Record<number, string> = { 1: 'Master Admin', 2: 'Admin', 3: 'Dosen', 4: 'Keuangan' };
    return map[roleId || 0] || 'Tidak Diketahui';
  };

  const statusColor = (status: string | null) => {
    const s = (status || '').toLowerCase();
    if (s === 'aktif') return 'bg-emerald-100 text-emerald-700';
    if (s === 'menunggu') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-500';
  };

  const tipeDisplay = (tipe: string | null): string => {
    const map: Record<string, string> = {
      create: 'Dibuat', update: 'Diubah', delete: 'Dihapus',
      verifikasi: 'Verifikasi', login: 'Masuk',
    };
    return map[(tipe || '').toLowerCase()] || tipe || '-';
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackLink href="/master_admin/monitoring-pengguna" />
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {user.master_dosen?.nama_lengkap || user.username}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{user.email} — {roleName(user.role_id)}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${statusColor(user.status_akun)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.status_akun === 'aktif' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {user.status_akun || 'Tidak Diketahui'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            Data Akun
          </h3>
          <form action={updateUserAction} className="space-y-4">
            <input type="hidden" name="id" value={user.id} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama_lengkap"
                  defaultValue={user.master_dosen?.nama_lengkap || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">NIP</label>
                <input
                  type="text"
                  name="nip"
                  defaultValue={user.master_dosen?.nip || ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email || ''}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  defaultValue={user.username || ''}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Username tidak dapat diubah</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Jurusan</label>
              <input
                type="text"
                name="jurusan"
                defaultValue={user.master_dosen?.jurusan || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Simpan Perubahan
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              Role & Status
            </h3>
            <div className="space-y-4">
              <form action={updateUserAction}>
                <input type="hidden" name="id" value={user.id} />
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Role</label>
                <div className="flex gap-3">
                  <select
                    name="role_id"
                    defaultValue={user.role_id || 3}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={14} />
                    Simpan Role
                  </button>
                </div>
              </form>

              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Status Akun</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {user.status_akun === 'aktif' ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <ToggleSwitch userId={user.id} currentStatus={user.status_akun || 'menunggu'} />
                  <DeleteUserButton userId={user.id} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-5 flex items-center gap-2">
              <KeyRound size={16} className="text-slate-400" />
              Reset Password
            </h3>
            <form action={resetPasswordAction} className="space-y-3">
              <input type="hidden" name="id" value={user.id} />
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Password Baru</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <KeyRound size={14} />
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Activity size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-800">Aktivitas Terbaru</h3>
          <span className="text-[11px] text-slate-400 ml-auto">20 aktivitas terakhir</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-5 py-3">Waktu</th>
                <th className="px-5 py-3">Aktivitas</th>
                <th className="px-5 py-3">Tipe</th>
              </tr>
            </thead>
            <tbody>
              {user.activity_logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-slate-400 text-sm">
                    <Activity size={32} className="mx-auto mb-2 text-slate-300" strokeWidth={1.5} />
                    Belum ada aktivitas
                  </td>
                </tr>
              ) : (
                user.activity_logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{log.aktivitas || '-'}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600">
                        {tipeDisplay(log.tipe)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
