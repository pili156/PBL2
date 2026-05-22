// app/admin/riwayat-dosen/[id_dosen]/keuangan/page.tsx
import { prisma } from '@/src/lib/prisma';
import { Info, Download, Cloud } from 'lucide-react'; // Ganti Search dengan Download sesuai gambar "Lihat Detail"
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface RiwayatKeuanganTabProps {
  params: Promise<{ id_dosen: string }>;
}

export default async function RiwayatKeuanganTab({ params }: RiwayatKeuanganTabProps) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) {
    notFound();
  }

  // Fetch Data Dosen untuk mengisi Header Profil
  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
    },
  });

  if (!dosen) {
    notFound();
  }

  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';
  const inisial = namaDosen.charAt(0).toUpperCase();
  const nip = dosen.master_dosen?.nip || '-';
  const jurusan = dosen.master_dosen?.jurusan || '-';

  // Fetch Daftar Keuangan
  const keuanganList = await prisma.pengajuanReimbursement.findMany({
    where: {
      pengajuan_studi: {
        user_id: idDosen,
      },
    },
    orderBy: {
      created_at: 'asc',
    },
  });

  // Calculate total approved amount
  const totalDisetujui = keuanganList
    .filter((k) => k.status_pencairan === 'DICAIRKAN')
    .reduce((total, k) => total + Number(k.nominal || 0), 0);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

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
      
      {/* 1. HEADER CARD PROFIL (Persis Halaman Status Studi & KHS) */}
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

        {/* Highlight Dinamis: Total Disetujui (Sesuai Gambar Kanan Bawah) */}
        <div className="bg-[#F0FDF4] border border-emerald-100 rounded-xl p-4 text-center min-w-[180px]">
          <p className="text-xs font-medium text-emerald-700 mb-1">Total Disetujui</p>
          <p className="text-2xl font-black text-slate-800">{formatRupiah(totalDisetujui)}</p>
        </div>
      </div>

      {/* 2. KONTEN TABEL KEUANGAN */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium w-16">No</th>
                <th className="px-6 py-4 font-medium">Semester</th>
                <th className="px-6 py-4 font-medium">Nominal</th>
                <th className="px-6 py-4 font-medium">Tanggal Pengajuan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center w-40">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {keuanganList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                    Belum ada pengajuan keuangan.
                  </td>
                </tr>
              ) : (
                keuanganList.map((k, index) => {
                  const statusText = (k.status_pencairan ?? 'PENDING').toUpperCase();

                  // Logika Status UI Sesuai Gambar
                  let statusStyle = 'bg-yellow-100 text-yellow-600'; // PENDING
                  if (statusText === 'DICAIRKAN' || statusText === 'SELESAI') {
                    statusStyle = 'bg-emerald-100 text-emerald-700'; // DICAIRKAN
                  } else if (statusText === 'DRAFT') {
                    statusStyle = 'bg-slate-100 text-slate-600'; // DRAFT
                  } else if (statusText === 'DITOLAK' || statusText === 'DIBATALKAN') {
                    statusStyle = 'bg-red-100 text-red-700';
                  }

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
                        {k.nominal ? formatRupiah(Number(k.nominal)) : 'Rp 0'}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(k.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-[10px] rounded font-bold tracking-wider ${statusStyle}`}>
                          {statusText}
                        </span>
                      </td>

                      <td className="px-6 py-4 flex justify-center">
                        {statusText === 'DRAFT' ? (
                          <Link
                            href={`/admin/riwayat-dosen/${idDosen}/keuangan/${k.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-500 bg-slate-50 rounded-md text-xs font-semibold hover:bg-slate-100 transition-colors w-32"
                          >
                            <Cloud size={14} /> Lanjut Upload
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/riwayat-dosen/${idDosen}/keuangan/${k.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-50 transition-colors w-32"
                          >
                            <Download size={14} /> Lihat Detail
                          </Link>
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
        <div className="bg-[#FFFDF5] border border-amber-200/60 rounded-lg p-3 flex items-center gap-3 mt-4">
          <Info className="text-amber-500 flex-shrink-0" size={18} />
          <p className="text-xs text-amber-800 font-medium">
            Klik Tombol <span className="font-bold">"Lihat Detail"</span> untuk melihat bukti pembayaran dan tracking proses pengajuan.
          </p>
        </div>

      </div>
    </div>
  );
}