import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { headers } from 'next/headers';
import { pengajuanSchema } from '@/src/lib/validation';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const userId = parseInt(headersList.get('x-user-id') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { master_dosen: true },
    });

    if (!user?.master_dosen) {
      return NextResponse.json(
        { error: 'Data profil dosen belum ada. Silakan lengkapi profil terlebih dahulu.' },
        { status: 400 }
      );
    }

    const dosen = user.master_dosen;
    const requiredFields: { key: string; label: string }[] = [
      { key: 'nidn', label: 'NIDN' },
      { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
      { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
      { key: 'email_pribadi', label: 'Email Pribadi' },
      { key: 'alamat', label: 'Alamat' },
    ];

    const missingFields = requiredFields
      .filter((f) => !dosen[f.key as keyof typeof dosen] || String(dosen[f.key as keyof typeof dosen]).trim() === '')
      .map((f) => f.label);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Profil belum lengkap. Silakan lengkapi data berikut: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = pengajuanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { jenis_studi_id, jalur_pendanaan_id, wilayah_studi, perguruan_tinggi, nama_beasiswa } = parsed.data;

    // Try to locate a suitable "waiting" status in master data.
    // Seed uses snake_case ('menunggu_verifikasi'), so search for common variants
    // and fall back to a case-insensitive contains match for 'menunggu'.
    let statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
      where: { nama_status: 'menunggu_verifikasi' },
    });

    if (!statusMenunggu) {
      statusMenunggu = await prisma.masterStatusPengajuan.findFirst({
        where: {
          OR: [
            { nama_status: { equals: 'menunggu_verifikasi', mode: 'insensitive' } },
            { nama_status: { contains: 'menunggu', mode: 'insensitive' } },
            { nama_status: { contains: 'menunggu_verifikasi', mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!statusMenunggu) {
      return NextResponse.json(
        { error: 'Status pengajuan tidak ditemukan. Silakan run seed database.' }, 
        { status: 500 }
      );
    }

    const pengajuanCount = await prisma.pengajuanStudi.count({
      where: { user_id: userId },
    });

    if (pengajuanCount > 0) {
      const existingPengajuan = await prisma.pengajuanStudi.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: { status: true },
      });

      // Jika pengajuan lama ditolak, buat pengajuan baru
      if (existingPengajuan?.status?.nama_status === 'ditolak') {
        const pengajuan = await prisma.pengajuanStudi.create({
          data: {
            user_id: userId,
            jenis_studi_id: jenis_studi_id ?? null,
            jalur_pendanaan_id: jalur_pendanaan_id ?? null,
            wilayah_studi: wilayah_studi ?? null,
            perguruan_tinggi: perguruan_tinggi ?? null,
            nama_beasiswa: nama_beasiswa ?? null,
            status_id: statusMenunggu.id,
            tanggal_pengajuan: new Date(),
          },
        });
        return NextResponse.json({ pengajuan }, { status: 201 });
      }

      return NextResponse.json({ 
        pengajuan: existingPengajuan, 
        message: 'Menggunakan pengajuan yang sudah ada' 
      }, { status: 200 });
    }

    const pengajuan = await prisma.pengajuanStudi.create({
      data: {
        user_id: userId,
        jenis_studi_id: jenis_studi_id ?? null,
        jalur_pendanaan_id: jalur_pendanaan_id ?? null,
        wilayah_studi: wilayah_studi ?? null,
        perguruan_tinggi: perguruan_tinggi ?? null,
        nama_beasiswa: nama_beasiswa ?? null,
        status_id: statusMenunggu.id,
        tanggal_pengajuan: new Date(),
      },
    });

    return NextResponse.json({ pengajuan }, { status: 201 });
  } catch (error: any) {
    console.error('=== ERROR CREATE PENGAJUAN ===', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Data sudah ada. ID mungkin bermasalah.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}