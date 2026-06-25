import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getStatusLabel } from '@/src/lib/status-utils';
import { exportDosen, exportRiwayatStudi, exportRiwayatKeuangan } from '@/src/lib/export-excel';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'dosen';
  const idDosen = searchParams.get('id_dosen');

  if (type === 'dosen') {
    const dosen = await prisma.user.findMany({
      where: { role_id: 3 },
      include: { master_dosen: true },
      orderBy: { username: 'asc' },
    });

    const data = dosen.map((d: any, i: any) => ({
      No: i + 1,
      Nama: d.master_dosen?.nama_lengkap || d.username || '-',
      NIP: d.master_dosen?.nip || '-',
      Jurusan: d.master_dosen?.jurusan || '-',
      Status: getStatusLabel(d.status_akun, 'akun'),
      'Terakhir Update': d.updated_at?.toLocaleDateString('id-ID') || '-',
    }));

    const buffer = Buffer.from(exportDosen(data));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="data-dosen.xlsx"`,
      },
    });
  }

  if (type === 'khs' && idDosen) {
    const dosen = await prisma.user.findUnique({
      where: { id: Number(idDosen) },
      include: {
        master_dosen: true,
        pengajuan_studi: {
          include: { monitoring_khs: { orderBy: { semester_ke: 'asc' } } },
        },
      },
    });

    if (!dosen) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const khsList = dosen.pengajuan_studi.flatMap((p: any) => p.monitoring_khs);
    const data = khsList.map((k: any, i: number) => ({
      No: i + 1,
      Semester: `Semester ${k.semester_ke ?? '-'}`,
      'Tahun Akademik': '-',
      IPS: k.ipk ? Number(k.ipk).toFixed(2) : '-',
      SKS: 20,
      'Tanggal Upload': k.tanggal_unggah?.toLocaleDateString('id-ID') || '-',
    }));

    const buffer = Buffer.from(exportRiwayatStudi(data));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="riwayat-studi-${idDosen}.xlsx"`,
      },
    });
  }

  if (type === 'keuangan' && idDosen) {
    const keuanganList = await prisma.pengajuanReimbursement.findMany({
      where: { pengajuan_studi: { user_id: Number(idDosen) } },
      orderBy: { created_at: 'asc' },
    });

    const data = keuanganList.map((k: any, i: number) => ({
      No: i + 1,
      Semester: `Semester ${k.semester_ke ?? '-'}`,
      Nominal: k.nominal ? `Rp ${Number(k.nominal).toLocaleString('id-ID')}` : '-',
      'Tanggal Pengajuan': k.created_at?.toLocaleDateString('id-ID') || '-',
      'Tanggal Cair': k.tanggal_pencairan?.toLocaleDateString('id-ID') || '-',
      Status: getStatusLabel(k.status_pencairan, 'pencairan'),
    }));

    const buffer = Buffer.from(exportRiwayatKeuangan(data));
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="riwayat-keuangan-${idDosen}.xlsx"`,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
