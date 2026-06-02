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
            monitoring_khs: { orderBy: { semester_ke: 'desc' }, take: 1 },
            sk_kementerian: { orderBy: { tanggal_terbit: 'desc' }, take: 1 },
            // TAMBAHAN: Ambil data reimbursement dan dokumen untuk grafik
            pengajuan_reimbursement: {
              orderBy: { semester_ke: 'asc' }
            },
            dokumen_pengajuan: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const pengajuan = user.pengajuan_studi[0];

    // --- LOGIKA UNTUK GRAFIK REIMBURSEMENT ---
    const grafikReimbursement = pengajuan?.pengajuan_reimbursement.map(item => ({
      semester: `Sem ${item.semester_ke}`,
      nominal: Number(item.nominal) || 0
    })) || [];

    // --- LOGIKA UNTUK GRAFIK DOKUMEN ---
    const statusCount = pengajuan?.dokumen_pengajuan.reduce((acc, curr) => {
      const status = curr.status_verifikasi || 'Belum Diunggah';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const grafikDokumen = Object.keys(statusCount).map(key => ({
      name: key,
      value: statusCount[key]
    }));

    const dashboardData = {
      nama_dosen: user.master_dosen?.nama_lengkap || user.username || "User",
      status_pengajuan: pengajuan?.status?.nama_status || "Belum ada pengajuan",
      semester: pengajuan?.monitoring_khs[0]?.semester_ke || "-",
      wilayah_studi: pengajuan?.wilayah_studi || "Belum ditentukan",
      jenis_studi: pengajuan?.jenis_studi?.nama_jenis || "Belum ditentukan",
      status_studi: pengajuan?.sk_kementerian[0]?.status_studi || "Belum ada SK",
      pendanaan: pengajuan?.jalur_pendanaan?.nama_pendanaan || "Belum ditentukan",
      grafikReimbursement, // Data untuk Bar Chart
      grafikDokumen        // Data untuk Pie Chart
    };

    return NextResponse.json(dashboardData, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}