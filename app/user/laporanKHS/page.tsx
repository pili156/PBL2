// app/user/laporanKHS/page.tsx

import { prisma } from '@/src/lib/prisma';
import { Plus, Eye, Pencil, Upload, Info } from 'lucide-react';
import Link from 'next/link';
import { headers } from 'next/headers';
import StatusBadge from "@/src/components/StatusBadge";

export const dynamic = 'force-dynamic';

export default async function LaporanKHSUserPage() {
  const headersList = await headers();
  const userId = parseInt(headersList.get('x-user-id') || '0');

  if (!userId) {
    return <div>Silakan login terlebih dahulu</div>;
  }

  const dosen = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          jalur_pendanaan: true,
          monitoring_khs: {
            orderBy: { semester_ke: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!dosen) {
    return <div>User tidak ditemukan</div>;
  }

  // HAPUS BLOKIRAN AWAL (Early Return)
  // Kita biarkan UI tetap merender meskipun data pengajuan belum ada

  const pengajuanAktif = dosen?.pengajuan_studi?.[0];
  const namaDosen = dosen?.master_dosen?.nama_lengkap || dosen?.username || 'Dosen Testing';
  const inisial = namaDosen.charAt(0).toUpperCase();
  const nip = dosen?.master_dosen?.nip || '-';
  const jurusan = dosen?.master_dosen?.jurusan || '-';
  const pendanaan = pengajuanAktif?.jalur_pendanaan?.nama_pendanaan || 'Belum Ada Data Studi';
  
  // Jika pengajuanAktif ada, ambil KHS-nya. Jika tidak, anggap kosong [].
  const khsTerupload = pengajuanAktif?.monitoring_khs || [];
  
  const totalSemester = 8;
  const tabelKHS = Array.from({ length: totalSemester }, (_, i) => {
    const semesterKe = i + 1;
    const dataKHS = khsTerupload.find(k => k.semester_ke === semesterKe);
    return {
      semester_ke: semesterKe,
      data: dataKHS || null,
    };
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800">KHS Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola dan pantau dokumen KHS Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {inisial}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Nama</p>
              <p className="text-sm font-bold text-slate-800">{namaDosen}</p>
              <p className="text-xs text-slate-500 mt-2 mb-1">NIP</p>
              <p className="text-sm font-bold text-slate-800">{nip}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Program Studi</p>
              <p className="text-sm font-bold text-slate-800">{jurusan}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Jalur Pendanaan</p>
              <p className="text-sm font-bold text-slate-800">{pendanaan}</p>
            </div>
          </div>
        </div>

        <div className={`border rounded-xl p-4 text-center min-w-[140px] ${pengajuanAktif ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
          <p className={`text-xs font-semibold mb-1 ${pengajuanAktif ? 'text-emerald-600' : 'text-slate-500'}`}>Status Studi</p>
          <p className={`text-xl font-black ${pengajuanAktif ? 'text-emerald-600' : 'text-slate-700'}`}>
            {pengajuanAktif ? 'Aktif' : 'Belum Mulai'}
          </p>
          <p className={`text-[11px] font-medium mt-1 ${pengajuanAktif ? 'text-emerald-600' : 'text-slate-400'}`}>
            Semester {khsTerupload.length > 0 ? khsTerupload[khsTerupload.length-1].semester_ke : 1}
          </p>
        </div>
      </div>

      {/* WARNING BANNER JIKA BELUM ADA PENGAJUAN STUDI */}
      {!pengajuanAktif && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-800 font-medium">
            <strong>Perhatian:</strong> Anda belum memiliki data Pengajuan Studi di database. Anda bisa melihat UI tabel di bawah, tetapi <strong>fitur Upload akan gagal (Error)</strong> jika data pengajuan studi belum dibuat.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-800">Riwayat KHS</h3>
          <Link 
            href="/user/laporanKHS/upload" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> Upload KHS Baru
          </Link>
        </div>

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
              {tabelKHS.map((item, index) => {
                const isUploaded = !!item.data;
                const statusKHS = isUploaded 
                  ? (item.data!.status_evaluasi || 'pending') 
                  : 'BELUM UPLOAD';
                
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
                      <StatusBadge status={statusKHS} domain="evaluasi" />
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        {statusKHS === 'valid' && item.data && (
                          <Link href={`/user/laporanKHS/${item.data.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 w-[110px] justify-center transition-all">
                            <Eye size={14} /> Lihat Detail
                          </Link>
                        )}
                        {(statusKHS === 'revisi' || statusKHS === 'pending') && item.data && (
                          <Link href={`/user/laporanKHS/${item.data.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 w-[110px] justify-center transition-all">
                            <Pencil size={14} /> Edit
                          </Link>
                        )}
                        {statusKHS === 'BELUM UPLOAD' && (
                          <Link href={`/user/laporanKHS/upload?semester=${item.semester_ke}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 w-[110px] justify-center transition-all">
                            <Upload size={14} /> Upload
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

        <div className="mt-6 bg-slate-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row gap-4 sm:items-center text-xs">
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

      </div>
    </div>
  );
}