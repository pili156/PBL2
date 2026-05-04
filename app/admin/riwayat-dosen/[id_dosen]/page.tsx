// app/admin/riwayat-dosen/[id_dosen]/page.tsx
import { prisma } from '@/lib/prisma';
import { Download } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RiwayatStudiTab({
  params,
}: {
  params: Promise<{ id_dosen: string }>;
}) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) {
    notFound();
  }

  // Fetch data Pengajuan DAN data Dosen (untuk Nama & NIP di dalam Card)
  const [pengajuanList, dosen] = await Promise.all([
    prisma.pengajuanStudi.findMany({
      where: { user_id: idDosen },
      include: {
        jenis_studi: true,
        jalur_pendanaan: true,
        status: true,
        dokumen_pengajuan: {
          include: { master_dokumen: true },
        },
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.user.findUnique({
      where: { id: idDosen },
      include: { master_dosen: true }
    })
  ]);

  const namaDosen = dosen?.master_dosen?.nama_lengkap || dosen?.username || '-';
  const nip = dosen?.master_dosen?.nip || '-';
  const jurusan = dosen?.master_dosen?.jurusan || '-';

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 space-y-6">
      {pengajuanList.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          Belum ada riwayat studi.
        </div>
      ) : (
        pengajuanList.map((pengajuan) => (
          <div key={pengajuan.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* KIRI: DETAIL PENGAJUAN (Format Baris Sesuai UI) */}
            <div className="border border-slate-200 rounded-xl p-6">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Nama Dosen</span>
                  <span className="text-sm font-bold text-slate-800">{namaDosen}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">NIP</span>
                  <span className="text-sm font-bold text-slate-800">{nip}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Program Studi / Jurusan</span>
                  <span className="text-sm font-bold text-slate-800">{jurusan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Jenis Studi</span>
                  <span className="text-sm font-bold text-slate-800">{pengajuan.jenis_studi?.nama_jenis || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Jalur Pendanaan</span>
                  <span className="text-sm font-bold text-slate-800">{pengajuan.jalur_pendanaan?.nama_pendanaan || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Tanggal Upload</span>
                  <span className="text-sm font-bold text-slate-800">
                    {pengajuan.tanggal_pengajuan
                      ? pengajuan.tanggal_pengajuan.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500">Status Pengajuan</span>
                  <span className={`px-3 py-1 text-xs rounded-md font-bold ${
                      pengajuan.status?.nama_status === 'Disetujui' || pengajuan.status?.nama_status === 'DITERIMA' ? 'bg-green-100 text-green-700' : 
                      pengajuan.status?.nama_status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {pengajuan.status?.nama_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* KANAN: DOKUMEN STUDI */}
            <div className="border border-slate-200 rounded-xl p-6">
              <h4 className="text-base font-bold text-slate-800 mb-4">Dokumen Studi</h4>
              <div className="space-y-3">
                {pengajuan.dokumen_pengajuan.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada dokumen.</p>
                ) : (
                  pengajuan.dokumen_pengajuan.map((doc) => (
                    <div key={doc.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{doc.master_dokumen?.nama_dokumen || 'Dokumen'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Diunggah {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                      <Download size={20} className="text-sigap-primary" />
                    </div>
                  ))
                )}
                {/* Tombol Lihat Lainnya */}
                {pengajuan.dokumen_pengajuan.length > 0 && (
                  <button className="w-full mt-4 py-3 border border-slate-200 rounded-lg text-sm font-medium text-sigap-primary hover:bg-slate-50 transition-colors">
                    Lihat Dokumen Lainnya
                  </button>
                )}
              </div>
            </div>

          </div>
        ))
      )}
    </div>
  );
}