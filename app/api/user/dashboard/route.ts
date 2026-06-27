import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';
import { getOverallPengajuanStatus } from '@/src/lib/status-utils';

export async function GET() {
  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        master_dosen: true,
        pengajuan_studi: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            status: true,
            jenis_studi: true,
            jalur_pendanaan: true,
            monitoring_khs: { orderBy: { semester_ke: 'asc' } },
            sk_kementerian: { orderBy: { tanggal_terbit: 'desc' }, take: 1 },
            pengajuan_reimbursement: { orderBy: { semester_ke: 'asc' } },
            dokumen_pengajuan: {
              where: {
                pengajuan_reimbursement_id: null,
              },
              include: { master_dokumen: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const pengajuan = user.pengajuan_studi[0];

    const isDoktorLulus = 
      (user.master_dosen?.pendidikan_terakhir === 'S3' && user.master_dosen?.tanggal_lulus) ||
      (pengajuan?.status?.nama_status === 'lulus' && 
       (pengajuan?.jenis_studi?.nama_jenis?.toLowerCase().includes('s3') || 
        pengajuan?.jenis_studi?.nama_jenis?.toLowerCase().includes('doktor')));

    const namaLengkap = user.master_dosen?.nama_lengkap || user.username || "User";
    const gelar = user.master_dosen?.gelar || '';
    
    const namaDisplay = isDoktorLulus && !namaLengkap.startsWith('Dr.') 
      ? `Dr. ${namaLengkap}` 
      : namaLengkap;
    const gelarDisplay = gelar;

    const khsList = pengajuan?.monitoring_khs || [];
    const timelineKHS = khsList.map(khs => ({
      semester: khs.semester_ke,
      status: khs.status_evaluasi || 'pending',
      ipk: khs.ipk ? Number(khs.ipk) : 0,
      tanggal: khs.tanggal_unggah,
    }));
      const grafikIPS = khsList
      .filter(khs => khs.ipk)
      .map(khs => ({
        semester: `Sem ${khs.semester_ke}`,
        ipk: Number(khs.ipk)
      }));

    const skInfo = pengajuan?.sk_kementerian[0] || null;

    const reimbursements = pengajuan?.pengajuan_reimbursement || [];
    const grafikReimbursement = reimbursements.map(item => ({
      semester: `Sem ${item.semester_ke}`,
      nominal: Number(item.nominal) || 0
    }));
    const summaryReimbursement = reimbursements.reduce((acc, curr) => {
      const nominal = Number(curr.nominal) || 0;
      if (curr.status_pencairan === 'dicairkan' || curr.status_pencairan === 'selesai') acc.dicairkan += nominal;
      else if (curr.status_pencairan === 'pending') acc.pending += nominal;
      acc.diajukan += nominal;
      return acc;
    }, { diajukan: 0, dicairkan: 0, pending: 0 });

    const checklistDokumen = pengajuan?.dokumen_pengajuan.map(doc => ({
      nama: doc.master_dokumen?.nama_dokumen || 'Dokumen',
      status: doc.status_verifikasi || 'pending',
      isMandatory: doc.master_dokumen?.is_mandatory || false,
      catatan: doc.catatan_revisi || null
    })) || [];

    // Calculate overall status based on documents
    const dokumenData = pengajuan?.dokumen_pengajuan.map(doc => ({
      file_path: doc.file_path,
      status_verifikasi: doc.status_verifikasi || 'pending'
    })) || [];
    const calculatedStatus = getOverallPengajuanStatus(dokumenData, pengajuan?.status?.nama_status);
    const overallStatusPengajuan = calculatedStatus !== null ? calculatedStatus : (pengajuan?.status?.nama_status || "Belum ada pengajuan");

    let currentSemester = 0;
    let progressPersen = 0;
    const maxSemester = 8;

    if (pengajuan) {
      currentSemester = khsList.length > 0 ? Math.max(...khsList.map(k => k.semester_ke || 1)) : 1;
      progressPersen = khsList.length > 0 ? Math.min(Math.round((currentSemester / maxSemester) * 100), 100) : 0;
    }

    const dashboardData = {
      nama_dosen: namaDisplay + (gelarDisplay ? `.${gelarDisplay}` : ''),
      status_pengajuan: overallStatusPengajuan,
      semester: currentSemester,
      progress_studi: progressPersen,
      wilayah_studi: pengajuan?.wilayah_studi || "Belum ditentukan",
      jenis_studi: pengajuan?.jenis_studi?.nama_jenis || "Belum ditentukan",
      status_studi: pengajuan?.sk_kementerian[0]?.status_studi || "Belum ada SK",
      pendanaan: pengajuan?.jalur_pendanaan?.nama_pendanaan || "Belum ditentukan",
      timelineKHS,
      grafikIPS,
      skInfo,
      summaryReimbursement,
      grafikReimbursement,
      checklistDokumen
    };

    return NextResponse.json(dashboardData, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
