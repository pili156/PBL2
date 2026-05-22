// app/admin/riwayat-dosen/[id_dosen]/page.tsx
import { prisma } from '@/src/lib/prisma';
import { AlertTriangle, Download, FileText, CheckCircle2, Clock, MapPin, Info } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface StatusStudiTabProps {
  params: Promise<{ id_dosen: string }>;
}

export default async function StatusStudiTab({ params }: StatusStudiTabProps) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  // --- LOGIKA FETCH DATA ASLI KAMU (TIDAK ADA YANG DIBUANG) ---
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

  if (!dosen) notFound();

  const pengajuanList = dosen.pengajuan_studi;
  const latestPengajuan = pengajuanList[0];

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- LOGIKA TRACKER PROGRESS (DINAMIS DARI DATABASE) ---
  const renderProgressTimeline = () => {
    if (!latestPengajuan) return null;

    const statusNama = latestPengajuan.status?.nama_status?.toLowerCase() ?? '';
    const isDisetujui = statusNama === 'disetujui' || statusNama === 'diterima' || statusNama === 'aktif';
    const skKementerian = latestPengajuan.sk_kementerian?.[0] ?? null;
    const semesterAktif = latestPengajuan.monitoring_khs.length > 0;
    const isSelesai = statusNama === 'lulus' || statusNama === 'selesai';
    const lastKhs = semesterAktif ? latestPengajuan.monitoring_khs[latestPengajuan.monitoring_khs.length - 1] : null;

    // Perhitungan bar warna hijau
    const progressWidth = isSelesai ? '100%' : semesterAktif ? '75%' : skKementerian ? '50%' : isDisetujui ? '25%' : '0%';

    const steps = [
      { label: 'Pengajuan', sub: formatDate(latestPengajuan.tanggal_pengajuan), active: true, done: true },
      { label: 'Internal', sub: isDisetujui ? 'Disetujui' : 'Proses', active: isDisetujui, done: isDisetujui },
      { label: 'SK Tugas Belajar', sub: skKementerian ? 'Terbit' : 'Proses', active: !!skKementerian, done: !!skKementerian },
      { label: 'Studi Aktif', sub: semesterAktif ? `Sem ${lastKhs?.semester_ke ?? '-'}` : 'Belum', active: semesterAktif, done: semesterAktif },
      { label: 'Selesai', sub: isSelesai ? 'Lulus' : 'Belum', active: isSelesai, done: isSelesai }
    ];

    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-8">Progress Studi Terbaru</h3>
        <div className="relative flex justify-between items-start w-full max-w-4xl mx-auto px-4 overflow-x-auto pb-4">
          <div className="absolute top-4 left-10 right-10 h-[2px] bg-slate-100 -z-10 min-w-[500px]"></div>
          <div className="absolute top-4 left-10 h-[2px] bg-emerald-500 -z-10 transition-all duration-500 min-w-[500px]" style={{ width: progressWidth, maxWidth: 'calc(100% - 5rem)' }}></div>
          
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center w-28 bg-white min-w-[100px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-sm ${step.done ? 'bg-emerald-500 text-white' : step.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step.done ? <CheckCircle2 size={16} /> : step.active ? <Clock size={16} /> : <MapPin size={16} />}
              </div>
              <p className={`text-[11px] font-bold text-center leading-tight ${step.active || step.done ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
              <p className="text-[10px] text-slate-400 text-center mt-1">{step.sub}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 1. TIMELINE PROGRESS DARI DATA TERBARU */}
      {renderProgressTimeline()}

      {/* 2. GRID KONTEN (3 KOLOM SEPERTI DESAIN BARU) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* KOLOM KIRI: Informasi Studi (Mengambil dari latestPengajuan) */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800">Detail Informasi Studi</h3>
          
          {latestPengajuan ? (
            <>
              <div className="space-y-4">
                {[
                  { label: 'Jenis Studi', value: latestPengajuan.jenis_studi?.nama_jenis || '-' },
                  { label: 'Wilayah Studi', value: latestPengajuan.wilayah_studi || '-' },
                  { label: 'Jalur Pendanaan', value: latestPengajuan.jalur_pendanaan?.nama_pendanaan || '-' },
                  { label: 'Tgl Pengajuan', value: formatDate(latestPengajuan.tanggal_pengajuan) },
                  { label: 'Status', value: latestPengajuan.status?.nama_status || '-', highlight: true }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                    <span className="text-slate-500">{item.label}</span>
                    {item.highlight ? (
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">{item.value}</span>
                    ) : (
                      <span className="font-bold text-slate-800 text-right">{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">
                <Info className="text-blue-500 flex-shrink-0" size={16} />
                <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                  Data diambil dari pengajuan terbaru. Status diperbarui oleh tim admin pusat.
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Belum ada data pengajuan studi.</p>
          )}
        </div>

        {/* KOLOM TENGAH: Grafik / Area KHS */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 lg:col-span-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Grafik Perkembangan IPK</h3>
          </div>
          {/* Area Grafik */}
          <div className="flex-1 w-full bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center min-h-[250px]">
            <p className="text-sm font-bold text-slate-800 mb-1">Area Grafik</p>
            <p className="text-xs text-slate-500">Pasang komponen LineChart di sini untuk visualisasi trend IPK KHS yang ada di database.</p>
          </div>
        </div>

        {/* KOLOM KANAN: Alert & Dokumen */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Perhatian (Contoh Alert Dinamis, bisa disesuaikan DB) */}
          <div className="bg-[#FFFDF5] border border-amber-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <h4 className="text-sm font-bold text-amber-900">Perhatian</h4>
            </div>
            <p className="text-xs text-amber-800 mb-2">Pastikan semua dokumen SK telah terunggah dengan benar.</p>
          </div>

          {/* Dokumen Terbaru (Ditarik dari DB pengajuan_studi) */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex justify-between items-center">
              Dokumen Terbaru
              <span className="text-[10px] text-slate-400 font-normal">
                {latestPengajuan ? (latestPengajuan.dokumen_pengajuan.length + (latestPengajuan.sk_kementerian?.length ? 1 : 0)) : 0} File
              </span>
            </h3>
            
            <div className="space-y-3">
              {!latestPengajuan || (latestPengajuan.dokumen_pengajuan.length === 0 && !latestPengajuan.sk_kementerian?.length) ? (
                <p className="text-xs text-slate-500 text-center py-4">Belum ada dokumen.</p>
              ) : (
                <>
                  {/* Render SK jika ada */}
                  {latestPengajuan.sk_kementerian?.map((sk: any, i: number) => (
                     <div key={`sk-${i}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                       <div className="flex items-center gap-3">
                         <FileText size={16} className="text-blue-500" />
                         <div>
                           <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">SK Tugas Belajar</p>
                           <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(sk.tanggal_terbit)}</p>
                         </div>
                       </div>
                       <a href={sk.file_sk_path || '#'} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                         <Download size={14} />
                       </a>
                     </div>
                  ))}

                  {/* Render Dokumen Pengajuan */}
                  {latestPengajuan.dokumen_pengajuan.slice(0, 3).map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]" title={doc.master_dokumen?.nama_dokumen || 'Dokumen'}>
                            {doc.master_dokumen?.nama_dokumen || 'Dokumen'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(doc.created_at)}</p>
                        </div>
                      </div>
                      <a href={doc.file_path || '#'} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <Link href={`/admin/riwayat-dosen/${idDosen}/dokumen`} className="block w-full text-center mt-4 text-[11px] font-bold text-blue-600 hover:underline">
              Lihat Semua Dokumen
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}