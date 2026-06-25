import { headers } from 'next/headers';
import { prisma } from '@/src/lib/prisma';
import { Plus, Eye, Upload, Info, Building2, GraduationCap, Pencil } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RiwayatStudiPage({
  searchParams,
}: {
  searchParams: Promise<{ pengajuan?: string }>;
}) {
  const sp = await searchParams;
  const selectedId = sp.pengajuan ? Number(sp.pengajuan) : undefined;

  const headersList = await headers();
  const userEmail = headersList.get('x-user-email');

  if (!userEmail) return <div className="text-center py-10 text-slate-500">Silakan login terlebih dahulu</div>;

  const currentUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!currentUser) return <div className="text-center py-10 text-slate-500">User tidak ditemukan</div>;

  const dosen = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          monitoring_khs: { orderBy: { semester_ke: 'asc' } },
          jenis_studi: true,
          status: true,
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!dosen) return <div className="text-center py-10 text-slate-500">Data tidak ditemukan</div>;

  const allPengajuan = dosen.pengajuan_studi;
  const activePengajuan = selectedId
    ? allPengajuan.find(p => p.id === selectedId) ?? allPengajuan[0]
    : allPengajuan[0];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Riwayat Studi</h3>
          <p className="text-sm text-slate-500 mt-0.5">Kelola dan unggah dokumen KHS Anda per semester</p>
        </div>
        <Link
          href="/user/laporanKHS/upload"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Upload KHS
        </Link>
      </div>

      {allPengajuan.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Pengajuan:</span>
          {allPengajuan.map((p) => {
            const isActive = p.id === activePengajuan?.id;
            return (
              <Link
                key={p.id}
                href={`/user/riwayat/studi?pengajuan=${p.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.jenis_studi?.nama_jenis || `Pengajuan #${p.id}`}
              </Link>
            );
          })}
        </div>
      )}

      {activePengajuan && (
        <div className="bg-slate-50 rounded-lg p-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-slate-400" />
            <span className="text-slate-600">{activePengajuan.perguruan_tinggi || 'Universitas'}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap size={14} className="text-slate-400" />
            <span className="text-slate-600">{activePengajuan.jenis_studi?.nama_jenis || '-'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">Status:</span>
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
              {activePengajuan.status?.nama_status || '-'}
            </span>
          </div>
        </div>
      )}

      {activePengajuan && <KhsTable pengajuan={activePengajuan} />}

      {!activePengajuan && (
        <div className="text-center py-10 text-slate-500">
          Belum ada pengajuan studi. Silakan ajukan studi terlebih dahulu.
        </div>
      )}
    </div>
  );
}

async function KhsTable({ pengajuan }: { pengajuan: any }) {
  const khsList = pengajuan.monitoring_khs || [];
  
  // Filter hanya KHS yang telah dikirim (sudah ada datanya)
  const uploadedKhsList = khsList.filter((k: any) => k && k.id);
  
  const tabelKHS = uploadedKhsList.map((dataKHS: any) => ({
    semester_ke: dataKHS.semester_ke,
    data: dataKHS,
  }));

  return (
    <>
      {tabelKHS.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <p>Belum ada KHS yang dikirim.</p>
          <Link href="/user/laporanKHS/upload" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">
            Upload KHS Pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-800">
              <th className="py-4 px-2 w-12 text-center">No</th>
              <th className="py-4 px-4">Semester</th>
              <th className="py-4 px-4">Tahun Akademik</th>
              <th className="py-4 px-4">IPS</th>
              <th className="py-4 px-4">Tanggal Upload</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tabelKHS.map((item: { semester_ke: number; data: any }, index: number) => {
              const isUploaded = !!item.data;
              const rawStatus = item.data!.status_evaluasi?.toLowerCase().trim() || 'pending';
              
              // Mapping status dari database ke kategori UI
              let statusKHS = 'pending';
              if (['valid', 'diterima', 'terverifikasi', 'selesai', 'disetujui'].includes(rawStatus)) {
                statusKHS = 'valid';
              } else if (['revisi', 'perlu_revisi', 'ditolak'].includes(rawStatus)) {
                statusKHS = 'revisi';
              } else if (['pending', 'menunggu_verifikasi', 'draft'].includes(rawStatus)) {
                statusKHS = 'pending';
              }

              return (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-2 text-sm text-slate-600 text-center">{index + 1}.</td>
                  <td className="py-4 px-4 text-sm text-slate-800">Semester {item.semester_ke}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {isUploaded ? item.data!.tahun_akademik || '-' : '-'}
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-800">
                    {isUploaded && item.data!.ipk ? Number(item.data!.ipk).toFixed(2) : '-'}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {isUploaded && item.data!.tanggal_unggah
                      ? new Date(item.data!.tanggal_unggah).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
                      : '-'}
                  </td>
                  <td className="py-4 px-4">
                    {statusKHS === 'valid' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> VALID
                      </span>
                    )}
                    {statusKHS === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span> PENDING
                      </span>
                    )}
                    {statusKHS === 'revisi' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> REVISI
                      </span>
                    )}
                    {statusKHS === 'belum upload' && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> BELUM UPLOAD
                      </span>
                    )}
                    {!['valid', 'pending', 'revisi', 'belum upload'].includes(statusKHS) && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span> {statusKHS.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      {statusKHS === 'valid' && item.data && (
                        <Link href={`/user/laporanKHS/${item.data.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 w-[110px] justify-center transition-all">
                          <Eye size={14} /> Lihat Detail
                        </Link>
                      )}
                      {statusKHS === 'revisi' && item.data && (
                        <Link href={`/user/laporanKHS/${item.data.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 w-[110px] justify-center transition-all">
                          <Pencil size={14} /> Lihat Detail
                        </Link>
                      )}
                      {statusKHS === 'pending' && item.data && (
                        <Link href={`/user/laporanKHS/${item.data.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 w-[110px] justify-center transition-all">
                          <Pencil size={14} /> Lihat Detail
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      <div className="bg-slate-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-center text-xs">
        <div className="flex items-center gap-2 text-blue-600 font-bold shrink-0">
          <Info size={16} /> Keterangan Status:
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <strong>VALID:</strong> KHS telah diverifikasi dan disetujui admin</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> <strong>PENDING:</strong> KHS sedang dalam antrean verifikasi</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> <strong>REVISI:</strong> Perbaiki sesuai catatan dari admin</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span> <strong>BELUM UPLOAD:</strong> KHS untuk semester ini belum diupload</span>
        </div>
      </div>
    </>
  );
}
