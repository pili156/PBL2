import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';

function isAdminRole(role: string | null): boolean {
  return role === 'admin_fakultas' || role === 'master_admin';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    if (!isAdminRole(headersList.get('x-user-role'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const pengajuanId = parseInt(id);

    const pengajuan = await prisma.pengajuanStudi.findUnique({
      where: { id: pengajuanId },
      include: {
        user: {
          include: {
            master_dosen: true,
          },
        },
        jenis_studi: true,
        jalur_pendanaan: true,
        wilayah: true,
        status: true,
      },
    });

    if (!pengajuan) {
      return NextResponse.json(
        { error: 'Pengajuan not found' },
        { status: 404 }
      );
    }

    const dokumenPengajuan = await prisma.dokumenPengajuan.findMany({
      where: {
        pengajuan_id: pengajuanId,
      },
      include: {
        master_dokumen: true,
      },
    });

    const dosen = pengajuan.user?.master_dosen;
    const detail = {
      id: pengajuan.id,
      nama_lengkap: dosen?.nama_lengkap || pengajuan.user?.username || 'Unknown',
      nip: dosen?.nip || 'N/A',
      jenis_studi: pengajuan.jenis_studi?.nama_jenis || 'N/A',
      jalur_pendanaan: pengajuan.jalur_pendanaan?.nama_pendanaan || 'N/A',
      wilayah_studi: pengajuan.wilayah?.nama_wilayah || 'N/A',
      status: pengajuan.status?.nama_status || 'N/A',
      tanggal_pengajuan: pengajuan.tanggal_pengajuan?.toISOString().split('T')[0] || '',
      dokumen: dokumenPengajuan.map((d) => ({
        id: d.id,
        nama_dokumen: d.master_dokumen?.nama_dokumen || 'Unknown',
        file_path: d.file_path || '',
        status_verifikasi: d.status_verifikasi || 'pending',
        catatan_revisi: d.catatan_revisi,
        updated_at: d.updated_at?.toISOString() || '',
      })),
    };

    return NextResponse.json(detail, { status: 200 });
  } catch (error) {
    console.error('Error fetching pengajuan detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detail' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    if (!isAdminRole(headersList.get('x-user-role'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const dokumentId = parseInt(id);
    const body = await request.json();
    const { status_verifikasi, catatan_revisi } = body;

    const dokumen = await prisma.dokumenPengajuan.findUnique({
      where: { id: dokumentId },
    });

    if (!dokumen) {
      return NextResponse.json(
        { error: 'Dokumen not found' },
        { status: 404 }
      );
    }

    const pengajuanId = dokumen.pengajuan_id;

    const updated = await prisma.dokumenPengajuan.update({
      where: { id: dokumentId },
      data: {
        status_verifikasi,
        catatan_revisi,
        updated_at: new Date(),
      },
    });

    const allDokumen = await prisma.dokumenPengajuan.findMany({
      where: { pengajuan_id: pengajuanId },
    });

    const allTerverifikasi = allDokumen.every((d) => d.status_verifikasi === 'terverifikasi');
    const hasRevisi = allDokumen.some((d) => d.status_verifikasi === 'revisi');
    const allPending = allDokumen.every((d) => d.status_verifikasi === 'pending');

    let newStatus: string;
    if (allTerverifikasi) {
      newStatus = 'Terverifikasi';
    } else if (hasRevisi) {
      newStatus = 'Revisi';
    } else {
      newStatus = 'Pending';
    }

    const statusMaster = await prisma.masterStatusPengajuan.findFirst({
      where: { nama_status: newStatus },
    });

    if (statusMaster && pengajuanId !== null) {
      await prisma.pengajuanStudi.update({
        where: { id: pengajuanId },
        data: { status_id: statusMaster.id },
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating dokumen:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}