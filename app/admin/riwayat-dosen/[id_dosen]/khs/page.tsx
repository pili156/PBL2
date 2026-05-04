// app/admin/riwayat-dosen/[id_dosen]/khs/page.tsx

import { prisma } from '@/lib/prisma';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RiwayatKhsTab({
  params,
}: {
  params: Promise<{ id_dosen: string }>;
}) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) {
    notFound();
  }

  const khsList = await prisma.monitoringKhs.findMany({
    where: {
      pengajuan_studi: {
        user_id: idDosen,
      },
    },
    orderBy: {
      semester_ke: 'asc',
    },
  });

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 space-y-6">

      {/* HEADER (Lixa ganti jadi Daftar KHS karena kalau "Riwayat Pengajuan Keuangan" itu typo dari desainmu hehe) */}
      <h3 className="text-base font-bold text-slate-800">
        Daftar KHS
      </h3>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Header disesuaikan dengan UI: Font gelap, Bold, Capitalize */}
            <tr className="border-b-2 border-slate-100 text-sm font-bold text-slate-800">
              <th className="px-4 py-4 w-12">No</th>
              <th className="px-4 py-4">Semester</th>
              <th className="px-4 py-4">IPK</th>
              <th className="px-4 py-4">Tanggal Unggah</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4 text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {khsList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                  Belum ada data KHS.
                </td>
              </tr>
            ) : (
              khsList.map((k, index) => {
                const statusText = k.status_evaluasi?.toUpperCase() || 'PENDING';
                
                // HANYA warna teks, TANPA background kotak (Sesuai Desain UI)
                let statusColor = 'text-yellow-500'; 
                if (statusText === 'VALID') statusColor = 'text-green-500';
                if (statusText === 'REVISI') statusColor = 'text-red-500';

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

                    <td className="px-4 py-4 text-sm text-slate-800">
                      {k.ipk ? Number(k.ipk).toFixed(2) : '-'}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-800">
                      {/* Format tanggal diubah ke UPPERCASE */}
                      {k.tanggal_unggah
                        ? k.tanggal_unggah.toLocaleDateString('id-ID', {
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
                        href={`/admin/riwayat-dosen/${idDosen}/khs/${k.id}`}
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

      {/* INFO BANNER */}
      <div className="bg-[#FFFDF5] border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
        <Info className="text-yellow-500 flex-shrink-0" size={20} />
        <p className="text-sm text-slate-600 font-medium">
          Klik Tombol "Lihat Detail" Untuk melihat dokumen KHS dan Informasi detail Semester
        </p>
      </div>

    </div>
  );
}