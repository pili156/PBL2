import { prisma } from '@/src/lib/prisma';
import { notFound } from 'next/navigation';
import AdminKeuanganForm from './AdminKeuanganForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id_dosen: string }>;
}

export default async function TambahKeuanganPage({ params }: Props) {
  const { id_dosen } = await params;
  const idDosen = Number(id_dosen);

  if (isNaN(idDosen)) notFound();

  const dosen = await prisma.user.findUnique({
    where: { id: idDosen },
    include: {
      master_dosen: true,
      pengajuan_studi: { take: 1, orderBy: { created_at: 'desc' } },
    },
  });

  if (!dosen || !dosen.pengajuan_studi[0]) notFound();

  const pengajuanId = dosen.pengajuan_studi[0].id;
  const nama = dosen.master_dosen?.nama_lengkap || dosen.username || 'Dosen';

  return (
    <AdminKeuanganForm
      pengajuanId={pengajuanId}
      idDosen={idDosen}
      nama={nama}
    />
  );
}
