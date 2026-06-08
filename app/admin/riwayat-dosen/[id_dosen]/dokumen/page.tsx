import { prisma } from '@/src/lib/prisma';
import { FileText, Download, Landmark, Eye, File, FileSpreadsheet, FileImage, Plus } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDateLong } from '@/src/lib/formatters';
import GenerateSurat, { GenerateSuratButton } from './GenerateSurat';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

const fileIcon = (path: string | null | undefined) => {
  if (!path) return File;
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return FileText;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return FileImage;
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return FileSpreadsheet;
  return File;
};

const fileColor = (path: string | null | undefined) => {
  if (!path) return 'text-slate-400 bg-slate-100';
  const ext = path.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'text-red-600 bg-red-50';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'text-blue-600 bg-blue-50';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'text-emerald-600 bg-emerald-50';
  return 'text-slate-500 bg-slate-100';
};

export default async function DokumenSuratPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: {
        include: {
          jenis_studi: true,
          dokumen_pengajuan: { include: { master_dokumen: true } },
          sk_kementerian: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!dosen) notFound();

  const namaDosen = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';
  const pengajuan = dosen.pengajuan_studi[0] ?? null;

  interface DokumenCategory {
    category: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    items: { id: string | number; name: string; date: Date | null | undefined; path: string | null | undefined; meta: string }[];
  }
  const dokumenAwal: DokumenCategory[] = [];

  if (!pengajuan) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
        <p className="text-sm text-slate-500 font-medium">Belum ada dokumen</p>
        <p className="text-xs text-slate-400 mt-1">Dosen belum memiliki pengajuan studi.</p>
      </div>
    );
  }

  const pengajuanRaw = pengajuan as Record<string, unknown>;
  const skKementerian = (pengajuanRaw.sk_kementerian || []) as Record<string, unknown>[];
  const dokPengajuan = (pengajuanRaw.dokumen_pengajuan || []) as Record<string, unknown>[];

  if (skKementerian.length > 0) {
    dokumenAwal.push({
      category: 'SK Tugas Belajar',
      icon: Landmark,
      items: skKementerian.map((sk: Record<string, unknown>) => ({
        id: sk.id as number,
        name: (sk.nomor_sk as string) || 'SK Tugas Belajar',
        date: sk.tanggal_terbit ? new Date(sk.tanggal_terbit as string) : null,
        path: sk.file_sk_path as string | null,
        meta: `Terbit: ${formatDateLong(sk.tanggal_terbit ? new Date(sk.tanggal_terbit as string) : null)}`,
      })),
    });
  }

  if (dokPengajuan.length > 0) {
    dokumenAwal.push({
      category: 'Dokumen Awal Studi',
      icon: FileText,
      items: dokPengajuan.map((doc: Record<string, unknown>) => ({
        id: doc.id as number,
        name: ((doc.master_dokumen as Record<string, unknown> | null)?.nama_dokumen as string) || 'Dokumen',
        date: doc.created_at ? new Date(doc.created_at as string) : null,
        path: doc.file_path as string | null,
        meta: `Upload: ${formatDateLong(doc.created_at ? new Date(doc.created_at as string) : null)}`,
      })),
    });
  }

  const totalDocs = dokumenAwal.reduce((a: number, c: { items: unknown[] }) => a + c.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Dokumen & Surat</h3>
          <p className="text-sm text-slate-400 mt-0.5">{totalDocs} dokumen awal studi</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/riwayat-dosen/${idDosen}/dokumen/tambah`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <Plus size={15} /> Upload Dokumen
          </Link>
          <GenerateSuratButton />
        </div>
      </div>

      {dokumenAwal.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
          <p className="text-sm text-slate-500 font-medium">Belum ada dokumen awal studi</p>
          <p className="text-xs text-slate-400 mt-1">SK Tugas Belajar, surat rekomendasi, LoA, dan dokumen lainnya akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dokumenAwal.map((category) => {
            const CatIcon = category.icon;
            return (
              <div key={category.category} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <div className="p-1.5 bg-slate-50 rounded-lg"><CatIcon size={16} className="text-slate-500" /></div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{category.category}</h4>
                    <p className="text-[10px] text-slate-400">{category.items.length} dokumen</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {category.items.map((item) => {
                    const Icon = item.path ? fileIcon(item.path) : File;
                    const colorClass = item.path ? fileColor(item.path) : 'text-slate-400 bg-slate-100';
                    const isAvailable = !!item.path;
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                        <div className={`p-2.5 rounded-lg ${colorClass} flex-shrink-0`}><Icon size={18} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.meta}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isAvailable ? (
                            <>
                              <a href={item.path || '#'} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Lihat"><Eye size={16} /></a>
                              <a href={item.path || '#'} download className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Download"><Download size={16} /></a>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum tersedia</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GenerateSurat namaDosen={namaDosen} />
    </div>
  );
}
