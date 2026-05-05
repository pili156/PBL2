// app/admin/riwayat-dosen/[id_dosen]/page.tsx
import { prisma } from '@/lib/prisma';
import { Info, Check, GraduationCap, Upload, FileText, Download, Landmark } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface StatusStudiTabProps {
  params: Promise<{ id_dosen: string }>;
}

export default async function StatusStudiTab({ params }: StatusStudiTabProps) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) {
    notFound();
  }

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          jenis_studi: true,
          jalur_pendanaan: true,
          status: true,
          dokumen_pengajuan: {
            include: { master_dokumen: true },
          },
          sk_kementerian: true,
          monitoring_khs: {
            orderBy: { semester_ke: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });

  if (!dosen) {
    notFound();
  }

  const pengajuanList = dosen.pengajuan_studi;
  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';
  const inisial = namaDosen.charAt(0).toUpperCase();
  const nip = dosen.master_dosen?.nip || '-';
  const jurusan = dosen.master_dosen?.jurusan || '-';

  const latestPengajuan = pengajuanList[0];
  let highlightStatus = "Belum Ada";
  let highlightSub = "-";
  let highlightColor = "bg-slate-50 text-slate-700";

  if (latestPengajuan) {
    const statusNama = latestPengajuan.status?.nama_status?.toLowerCase() ?? '';
    const isSelesai = statusNama === 'lulus' || statusNama === 'selesai';
    const isAktif = latestPengajuan.monitoring_khs.length > 0;

    if (isSelesai) {
      highlightStatus = "Selesai Studi";
      highlightSub = "Lulus";
      highlightColor = "bg-[#F0FDF4] text-emerald-700";
    } else if (isAktif) {
      const lastSemester = latestPengajuan.monitoring_khs[latestPengajuan.monitoring_khs.length - 1];
      highlightStatus = "Studi Aktif";
      highlightSub = `Semester ${lastSemester?.semester_ke ?? '-'}`;
      highlightColor = "bg-[#F0FDF4] text-emerald-700";
    } else {
      highlightStatus = "Proses Pengajuan";
      highlightSub = "Menunggu SK";
      highlightColor = "bg-[#FFFDF5] text-amber-700";
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER CARD PROFIL */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
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
        <div className={`rounded-xl p-4 text-center min-w-[160px] ${highlightColor}`}>
          <p className="text-xs font-medium mb-1 opacity-80">Status Saat Ini</p>
          <p className="text-lg font-bold">{highlightStatus}</p>
          <p className="text-[11px] font-semibold mt-1 opacity-90">{highlightSub}</p>
        </div>
      </div>

      {/* 2. KONTEN STATUS STUDI (HYBRID DESIGN) */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-12">
        
        {pengajuanList.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Belum ada data status studi untuk dosen ini.</p>
          </div>
        ) : (
          pengajuanList.map((pengajuan) => {
            const statusNama = pengajuan.status?.nama_status?.toLowerCase() ?? '';
            const isDisetujui = statusNama === 'disetujui' || statusNama === 'diterima' || statusNama === 'aktif';
            const skKementerian = pengajuan.sk_kementerian?.[0] ?? null;
            const semesterAktif = pengajuan.monitoring_khs.length > 0;
            const isSelesai = statusNama === 'lulus' || statusNama === 'selesai';

            const lastKhs = pengajuan.monitoring_khs.length > 0 
              ? pengajuan.monitoring_khs[pengajuan.monitoring_khs.length - 1] 
              : null;

            return (
              <div key={pengajuan.id} className="space-y-12 border-b border-slate-100 pb-10 last:border-0 last:pb-0">
                  
                  {/* TRACKER PROGRESS (Visual & Modern) */}
                  <div className="relative flex justify-between items-start w-full max-w-4xl mx-auto">
                    <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-100 -z-10"></div>
                    <div className="absolute top-5 left-10 h-[2px] -z-10 bg-emerald-500 transition-all duration-500" 
                        style={{ width: isSelesai ? '100%' : semesterAktif ? '75%' : skKementerian ? '50%' : isDisetujui ? '25%' : '0%' }}></div>

                    {/* Step logic... (Sama seperti sebelumnya namun dengan styling lebih sleek) */}
                    {[
                      { label: 'Pengajuan', sub: formatDate(pengajuan.tanggal_pengajuan), active: true, done: true },
                      { label: 'Internal', sub: isDisetujui ? 'Disetujui' : 'Proses', active: isDisetujui, done: isDisetujui },
                      { label: 'SK Tugas Belajar', sub: skKementerian ? 'Terbit' : 'Proses', active: !!skKementerian, done: !!skKementerian },
                      { label: 'Studi Aktif', sub: semesterAktif ? `Sem ${lastKhs?.semester_ke ?? '-'}` : 'Belum', active: semesterAktif, done: semesterAktif },
                      { label: 'Selesai', sub: isSelesai ? 'Lulus' : 'Belum', active: isSelesai, done: isSelesai }
                    ].map((step, i) => (
                      <div key={i} className="flex flex-col items-center w-28">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm ${step.done ? 'bg-emerald-500 text-white' : step.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                          {step.done ? <Check size={18} strokeWidth={3} /> : <GraduationCap size={18} />}
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 text-center leading-tight">{step.label}</p>
                        <p className="text-[10px] text-slate-400 text-center mt-1">{step.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* 2-COLUMN DETAIL SECTION (Informasi Detail vs Dokumen) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                    
                    {/* KIRI: DETAIL INFORMASI (Beneran Detail) */}
                    <div className="border border-blue-500 rounded-xl p-6 bg-white shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Info size={16} className="text-blue-500" /> Detail Informasi Studi
                      </h4>
                      <div className="space-y-4">
                        {[
                          { label: 'Nama Dosen', value: namaDosen },
                          { label: 'NIP', value: nip },
                          { label: 'Program Studi / Jurusan', value: jurusan },
                          { label: 'Jenis Studi', value: pengajuan.jenis_studi?.nama_jenis || '-' },
                          { label: 'Wilayah Studi', value: pengajuan.wilayah_studi || '-' },
                          { label: 'Jalur Pendanaan', value: pengajuan.jalur_pendanaan?.nama_pendanaan || '-' },
                          { label: 'Tanggal Mulai', value: formatDate(pengajuan.tanggal_pengajuan) },
                          { label: 'Status Pengajuan', value: pengajuan.status?.nama_status || '-', badge: true }
                        ].map((item, i) => (
                          <div key={i} className="grid grid-cols-5 gap-2 items-start py-1">
                            <span className="text-xs text-slate-500 col-span-2">{item.label}</span>
                            <div className="col-span-3 text-right">
                              {item.badge ? (
                                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                  {item.value}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-800 leading-relaxed">{item.value || '-'}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KANAN: DOKUMEN STUDI (List Downloadable) */}
                    <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/30">
                      <h4 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2"><FileText size={16} className="text-slate-400" /> Dokumen Studi</span>
                        <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest font-mono">Total: {pengajuan.dokumen_pengajuan.length + (skKementerian ? 1 : 0)}</span>
                      </h4>
                      
                      <div className="space-y-3">
                        {/* Tampilkan SK Kementerian jika ada */}
                        {skKementerian && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Landmark size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">SK Tugas Belajar (Pusat)</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Terbit: {formatDate(skKementerian.tanggal_terbit)}</p>
                              </div>
                            </div>
                            <a href={skKementerian.file_sk_path || '#'} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                              <Download size={18} />
                            </a>
                          </div>
                        )}

                        {/* Tampilkan List Dokumen Lainnya */}
                        {pengajuan.dokumen_pengajuan.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-50 rounded text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{doc.master_dokumen?.nama_dokumen || 'Dokumen Lainnya'}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Diunggah: {formatDate(doc.created_at)}</p>
                              </div>
                            </div>
                            <a href={doc.file_path || '#'} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                              <Download size={18} />
                            </a>
                          </div>
                        ))}

                        <button className="w-full mt-4 py-2.5 text-[11px] font-bold text-blue-600 border border-blue-100 rounded-lg bg-blue-50/50 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-wider">
                          Lihat Dokumen Lainnya
                        </button>
                      </div>
                    </div>

                  </div>

                  <div className="bg-[#FFFDF5] border border-amber-200/60 rounded-lg p-3 flex items-center gap-3 mt-4">
                    <Info className="text-amber-500 flex-shrink-0" size={18} />
                    <p className="text-[11px] text-amber-800 font-medium">
                      Status akan otomatis diperbarui sesuai progres dan data terbaru yang diinputkan oleh tim admin pusat.
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
}
