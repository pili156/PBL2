// app/api/user/dashboard/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        master_dosen: true,
        pengajuan_studi: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            status: true,
            jenis_studi: true,
            jalur_pendanaan: true,
            // Ambil semua histori KHS untuk Timeline & Grafik IPK
            monitoring_khs: { orderBy: { semester_ke: 'asc' } },
            // Ambil info SK
            sk_kementerian: { orderBy: { tanggal_terbit: 'desc' }, take: 1 },
            // Ambil semua reimbursement
            pengajuan_reimbursement: { orderBy: { semester_ke: 'asc' } },
            // Ambil dokumen berserta relasi nama dokumennya untuk checklist
            dokumen_pengajuan: { include: { master_dokumen: true } }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const pengajuan = user.pengajuan_studi[0];

    // 1. Data KHS (Timeline & IPK)
    const khsList = pengajuan?.monitoring_khs || [];
    const timelineKHS = khsList.map(khs => ({
      semester: khs.semester_ke,
      status: khs.status_evaluasi || 'Pending',
      ipk: khs.ipk ? Number(khs.ipk) : 0,
      tanggal: khs.tanggal_unggah,
    }));
    const grafikIPK = khsList
      .filter(khs => khs.ipk)
      .map(khs => ({
        semester: `Sem ${khs.semester_ke}`,
        ipk: Number(khs.ipk)
      }));

    // 2. Data SK
    const skInfo = pengajuan?.sk_kementerian[0] || null;

    // 3. Data Reimbursement (Summary & Chart)
    const reimbursements = pengajuan?.pengajuan_reimbursement || [];
    const grafikReimbursement = reimbursements.map(item => ({
      semester: `Sem ${item.semester_ke}`,
      nominal: Number(item.nominal) || 0
    }));
    const summaryReimbursement = reimbursements.reduce((acc, curr) => {
      const nominal = Number(curr.nominal) || 0;
      if (curr.status_pencairan === 'Dicairkan' || curr.status_pencairan === 'Selesai') acc.dicairkan += nominal;
      else if (curr.status_pencairan === 'Pending') acc.pending += nominal;
      acc.diajukan += nominal;
      return acc;
    }, { diajukan: 0, dicairkan: 0, pending: 0 });

    // 4. Checklist Dokumen
    const checklistDokumen = pengajuan?.dokumen_pengajuan.map(doc => ({
      nama: doc.master_dokumen?.nama_dokumen || 'Dokumen',
      status: doc.status_verifikasi || 'Pending',
      isMandatory: doc.master_dokumen?.is_mandatory || false,
      catatan: doc.catatan_revisi || null
    })) || [];

    // 5. Progress Masa Studi (Asumsi Target 8 Semester)
    const currentSemester = khsList.length > 0 ? Math.max(...khsList.map(k => k.semester_ke || 1)) : 1;
    const maxSemester = 8; 
    const progressPersen = Math.min(Math.round((currentSemester / maxSemester) * 100), 100);

    const dashboardData = {
      nama_dosen: user.master_dosen?.nama_lengkap || user.username || "User",
      status_pengajuan: pengajuan?.status?.nama_status || "Belum ada pengajuan",
      semester: currentSemester,
      progress_studi: progressPersen,
      wilayah_studi: pengajuan?.wilayah_studi || "Belum ditentukan",
      jenis_studi: pengajuan?.jenis_studi?.nama_jenis || "Belum ditentukan",
      status_studi: pengajuan?.sk_kementerian[0]?.status_studi || "Belum ada SK",
      pendanaan: pengajuan?.jalur_pendanaan?.nama_pendanaan || "Belum ditentukan",
      timelineKHS,
      grafikIPK,
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