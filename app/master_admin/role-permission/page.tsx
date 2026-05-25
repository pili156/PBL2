import { prisma } from '@/src/lib/prisma';
import { Shield, ShieldCheck, Users, BookOpen, Wallet, Settings, ClipboardList, UserCog, UserCheck, LayoutDashboard } from "lucide-react";

export const dynamic = 'force-dynamic';

const roleData = [
  {
    id: 'master_admin',
    name: 'Master Admin',
    icon: ShieldCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    description: 'Super administrator dengan akses penuh ke seluruh sistem. Bisa mengelola pengguna, role, dan melihat semua data.',
    permissions: [
      'Mengelola semua pengguna (tambah, edit, hapus)',
      'Mengubah role & hak akses pengguna',
      'Melihat semua log aktivitas sistem',
      'Mengakses semua halaman admin (dashboard, verifikasi, monitoring)',
      'Mengaktifkan / menonaktifkan akun',
      'Melihat data monitoring dosen & buku induk',
    ],
  },
  {
    id: 'admin_fakultas',
    name: 'Admin',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Administrator fakultas yang mengelola operasional sehari-hari terkait studi lanjut dosen.',
    permissions: [
      'Verifikasi pengajuan studi lanjut dosen',
      'Monitoring & riwayat studi dosen',
      'Mengelola data KHS, keuangan, dokumen',
      'Menerbitkan SK Tugas Belajar',
      'Mengelola bantuan studi',
      'Melihat dashboard & status pengajuan',
    ],
  },
  {
    id: 'dosen',
    name: 'Dosen',
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Pengguna utama sistem. Dosen dapat mengajukan studi lanjut dan memantau progres pengajuan.',
    permissions: [
      'Mengajukan studi lanjut',
      'Mengunggah dokumen persyaratan',
      'Melihat status pengajuan',
      'Mengajukan reimbursement',
      'Mengunggah KHS setiap semester',
      'Melihat riwayat pengajuan sendiri',
    ],
  },
  {
    id: 'keuangan',
    name: 'Keuangan',
    icon: Wallet,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Bagian keuangan yang mengelola pencairan dana reimbursement studi dosen.',
    permissions: [
      'Melihat pengajuan reimbursement',
      'Memproses pencairan dana',
      'Mencatat nominal & status pencairan',
      'Melihat dashboard keuangan',
    ],
  },
];

const permissionMatrix = [
  { area: 'Dashboard', master_admin: true, admin: true, dosen: true, keuangan: true },
  { area: 'Verifikasi Pengajuan', master_admin: true, admin: true, dosen: false, keuangan: false },
  { area: 'Monitoring Dosen', master_admin: true, admin: true, dosen: false, keuangan: false },
  { area: 'Buku Induk', master_admin: true, admin: true, dosen: false, keuangan: false },
  { area: 'Monitoring Pengguna', master_admin: true, admin: false, dosen: false, keuangan: false },
  { area: 'Kelola Pengguna', master_admin: true, admin: false, dosen: false, keuangan: false },
  { area: 'Peran & Hak Akses', master_admin: true, admin: false, dosen: false, keuangan: false },
  { area: 'Log Aktivitas', master_admin: true, admin: false, dosen: false, keuangan: false },
  { area: 'Pengajuan Studi', master_admin: false, admin: false, dosen: true, keuangan: false },
  { area: 'Reimbursement', master_admin: false, admin: false, dosen: true, keuangan: true },
  { area: 'Edit Profil Sendiri', master_admin: true, admin: true, dosen: true, keuangan: true },
];

export default async function RolePermissionPage() {
  const roles = await prisma.masterRole.findMany();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Peran & Hak Akses</h2>
        <p className="text-sm text-slate-500 mt-1">Informasi tentang peran (role) dan hak akses masing-masing pengguna dalam sistem SIGAP</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roleData.map((role) => {
          const Icon = role.icon;
          return (
            <div key={role.id} className={`bg-white rounded-xl border ${role.border} shadow-sm p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`${role.bg} p-3 rounded-xl`}>
                  <Icon size={24} className={role.color} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{role.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{role.id}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{role.description}</p>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Hak Akses:</h4>
                <ul className="space-y-1.5">
                  {role.permissions.map((perm, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <ShieldCheck size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{perm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            Matriks Hak Akses
          </h3>
          <p className="text-sm text-slate-400 mt-1">Tabel berikut menunjukkan fitur apa saja yang bisa diakses oleh masing-masing role.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4">Fitur / Halaman</th>
                <th className="px-6 py-4 text-center">Master Admin</th>
                <th className="px-6 py-4 text-center">Admin</th>
                <th className="px-6 py-4 text-center">Dosen</th>
                <th className="px-6 py-4 text-center">Keuangan</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-sm font-medium text-slate-700">{row.area}</td>
                  {['master_admin', 'admin', 'dosen', 'keuangan'].map((role) => (
                    <td key={role} className="px-6 py-3.5 text-center">
                      {row[role as keyof typeof row] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                          <ShieldCheck size={14} />
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
