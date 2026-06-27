import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getDashboardData } from '../actions';
import { headers } from 'next/headers';
import UploadKHSForm from '../UploadKHSForm';

export default async function UploadKHSPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const prefillSemester = resolvedSearchParams.semester || '';

  const headersList = await headers();
  const userId = parseInt(headersList.get('x-user-id') || '0');

  if (!userId) {
    return <div>Silakan login terlebih dahulu</div>;
  }
  const dashboardData = await getDashboardData(userId);

  if (!dashboardData?.pengajuan_studi?.[0]) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Link
            href="/user/riwayat/studi"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upload KHS</h2>
            <p className="text-sm text-slate-900 mt-1">Unggah dokumen KHS untuk semester Anda</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-amber-800">Belum ada pengajuan studi</p>
            <p className="text-xs text-amber-700 mt-1">
              Anda harus membuat pengajuan studi terlebih dahulu sebelum dapat mengupload KHS.
            </p>
            <Link
              href="/user/pengajuan"
              className="inline-block mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
            >
              Buat Pengajuan Studi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pengajuan = dashboardData.pengajuan_studi[0];
  const isDitolak = pengajuan.status?.nama_status === 'ditolak';
  const hasSk = !!pengajuan.sk_kementerian?.[0]?.file_sk_path;

  if (isDitolak) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Link
            href="/user/riwayat/studi"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upload KHS</h2>
            <p className="text-sm text-slate-900 mt-1">Unggah dokumen KHS untuk semester Anda</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-red-800">Pengajuan studi ditolak</p>
            <p className="text-xs text-red-700 mt-1">
              Pengajuan studi Anda telah ditolak oleh admin. Silakan buat pengajuan studi baru untuk dapat mengupload KHS.
            </p>
            <Link
              href="/user/pengajuan"
              className="inline-block mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Buat Pengajuan Studi Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasSk) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
          <Link
            href="/user/riwayat/studi"
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upload KHS</h2>
            <p className="text-sm text-slate-900 mt-1">Unggah dokumen KHS untuk semester Anda</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold text-amber-800">Menunggu persetujuan admin</p>
            <p className="text-xs text-amber-700 mt-1">
              Pengajuan studi Anda belum disetujui atau SK belum diterbitkan oleh admin. Upload KHS hanya dapat dilakukan setelah pengajuan disetujui dan SK diterbitkan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const existingSemesters: number[] = pengajuan.monitoring_khs
    .map((khs) => khs.semester_ke)
    .filter((s): s is number => s !== null) || [];

  return (
    <UploadKHSForm
      prefillSemester={prefillSemester}
      existingSemesters={existingSemesters}
    />
  );
}