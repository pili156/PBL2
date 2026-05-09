// app/admin/riwayat-dosen/[id_dosen]/khs/page.tsx
import { prisma } from '@/lib/prisma';
import { Info, Download, Cloud } from 'lucide-react'; 
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface RiwayatKhsTabProps {
  params: Promise<{ id_dosen: string }>;
}

export default async function RiwayatKhsTab({ params }: RiwayatKhsTabProps) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) {
    notFound();
  }

  // Fetch Data Dosen SEKALIGUS Data KHS-nya
  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          monitoring_khs: {
            orderBy: { semester_ke: 'asc' },
          },
        },
      },
    },
  });

  if (!dosen) {
    notFound();
  }

  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';
  const inisial = namaDosen.charAt(0).toUpperCase();
  const nip = dosen.master_dosen?.nip || '-';
  const jurusan = dosen.master_dosen?.jurusan || '-';

  // Ekstrak list KHS dari relasi pengajuan_studi
  const khsList = dosen.pengajuan_studi.flatMap((p) => p.monitoring_khs);

  // Kalkulasi Rata-rata IPK (Hanya untuk KHS yang sudah punya nilai IPK)
  const validKhs = khsList.filter((k) => k.ipk !== null && k.ipk !== undefined);
  const rataRataIpk = validKhs.length > 0
    ? (validKhs.reduce((acc, k) => acc + Number(k.ipk), 0) / validKhs.length).toFixed(2)
    : "0.00";

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER CARD PROFIL (Persis Halaman Status Studi) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        
        <div className="flex items-center gap-6">
          {/* Avatar Inisial */}
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {inisial}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Nama Dosen</p>
              <p className="text-sm font-bold text-slate-800">{namaDosen}</p>
              <p className="text-xs text-slate-500 mt-2 mb-1">NIP</p>
              <p className="text-sm font-bold text-slate-800">{nip}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Program Studi / Jurusan</p>
              <p className="text-sm font-bold text-slate-800">{jurusan}</p>
            </div>
          </div>
        </div>

        {/* Highlight Dinamis: Rata-rata IPK */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-4 text-center min-w-[160px]">
          <p className="text-xs font-semibold text-slate-500 mb-1">Rata-rata IPK</p>
          <p className="text-3xl font-black text-slate-800">{rataRataIpk}</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1">Dari 4.00</p>
        </div>

      </div>

      {/* 2. KONTEN TABEL KHS */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium w-16">No</th>
                <th className="px-6 py-4 font-medium">Semester</th>
                <th className="px-6 py-4 font-medium">IPK</th>
                <th className="px-6 py-4 font-medium">Tanggal Unggah</th>
                <th className="px-6 py-4 font-medium text-center w-40">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {khsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                    Belum ada data KHS.
                  </td>
                </tr>
              ) : (
                khsList.map((k, index) => {
                  return (
                    <tr
                      key={k.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">{index + 1}.</td>

                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        Semester {k.semester_ke}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-800">
                        {k.ipk ? Number(k.ipk).toFixed(2) : '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(k.tanggal_unggah)}
                      </td>

                      <td className="px-6 py-4 flex justify-center">
                        {k.file_khs_path ? (
                          <a
                            href={k.file_khs_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors w-32"
                          >
                            <Download size={14} /> Download
                          </a>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-400 bg-slate-50 rounded-md text-xs font-medium w-32">
                            <Cloud size={14} /> Belum Upload
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Banner Kuning Info */}
        <div className="bg-[#FFFDF5] border border-amber-200/60 rounded-lg p-3 flex items-center gap-3">
          <Info className="text-amber-500 flex-shrink-0" size={18} />
          <p className="text-xs text-amber-800 font-medium">
            Klik tombol <span className="font-bold">"Download"</span> untuk mengunduh dokumen KHS.
          </p>
        </div>

      </div>
    </div>
  );
}