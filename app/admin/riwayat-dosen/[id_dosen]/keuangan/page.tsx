// app/admin/riwayat-dosen/[id_dosen]/keuangan/page.tsx

import { prisma } from '@/lib/prisma';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RiwayatKeuanganTab({
  params,
}: {
  params: Promise<{ id_dosen: string }>;
}) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) {
    notFound();
  }

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

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 space-y-6">

      {/* HEADER */}
      <h3 className="text-base font-bold text-slate-800">
        Daftar Pengajuan Keuangan
      </h3>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Header disesuaikan dengan UI: Font gelap, Bold, Capitalize */}
            <tr className="border-b-2 border-slate-100 text-sm font-bold text-slate-800">
              <th className="px-4 py-4 w-12">No</th>
              <th className="px-4 py-4">Semester</th>
              <th className="px-4 py-4">Nominal</th>
              <th className="px-4 py-4">Tanggal Pengajuan</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-center w-32">Aksi</th>
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
                const statusText = k.status_pencairan?.toUpperCase() || 'PENDING';

                // HANYA warna teks, TANPA background kotak (Sesuai Desain UI)
                let statusColor = 'text-yellow-500'; 
                if (statusText === 'DICAIRKAN' || statusText === 'SELESAI') statusColor = 'text-green-500';
                if (statusText === 'DITOLAK' || statusText === 'DIBATALKAN') statusColor = 'text-red-500';

                return (
                  <tr
                    key={k.id}
                    // Trik warna baris selang-seling (Zebra Striping)
                    className={`border-b border-slate-50 last:border-0 hover:bg-slate-100 transition ${
                      index % 2 === 0 ? 'bg-[#F8FAFF]' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-slate-800">{index + 1}.</td>

                    <td className="px-4 py-4 text-sm text-slate-800">
                      Semester {k.semester_ke}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-800 font-medium">
                      {k.nominal ? formatRupiah(Number(k.nominal)) : 'Rp 0'}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-800">
                      {/* Format tanggal diubah ke UPPERCASE */}
                      {k.created_at
                        ? k.created_at.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          }).toUpperCase()
                        : '-'}
                    </td>

                    <td className="px-4 py-4">
                      {/* Class background dihapus, murni teks */}
                      <span className={`text-sm font-bold ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <Link
                        href={`/admin/riwayat-dosen/${idDosen}/keuangan/${k.id}`}
                        className="text-sm font-medium text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* INFO BANNER (Warna disesuaikan UI) */}
      <div className="bg-[#FFFDF5] border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
        <Info className="text-yellow-500 flex-shrink-0" size={20} />
        <p className="text-sm text-slate-600 font-medium">
          Klik Tombol "Lihat Detail" Untuk melihat bukti pembayaran dan Status pengajuan.
        </p>
      </div>

    </div>
  );
}