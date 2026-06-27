import { prisma } from './prisma';

/**
 * Check if a user has completed their doctoral studies (S3)
 * @param userId - The user ID to check
 * @returns true if the user has completed S3 studies
 */
export async function isDoktorLulus(userId: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      master_dosen: {
        select: {
          pendidikan_terakhir: true,
          tanggal_lulus: true,
          gelar: true,
          nama_lengkap: true,
        },
      },
      pengajuan_studi: {
        include: {
          status: true,
          jenis_studi: true,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  if (!user?.master_dosen) return false;

  const dosen = user.master_dosen;
  const pengajuan = user.pengajuan_studi[0];

  // Check if nama_lengkap already starts with "Dr."
  if (dosen.nama_lengkap?.startsWith('Dr.')) return true;

  // Check if gelar already starts with "Dr."
  if (dosen.gelar?.startsWith('Dr.')) return true;

  // Check if pendidikan_terakhir is S3 and has tanggal_lulus
  if (dosen.pendidikan_terakhir === 'S3' && dosen.tanggal_lulus) return true;

  // Check if pengajuan status is lulus and jenis studi is S3
  if (pengajuan?.status?.nama_status === 'lulus') {
    const jenisStudi = pengajuan.jenis_studi?.nama_jenis?.toLowerCase() || '';
    if (jenisStudi.includes('s3') || jenisStudi.includes('doktor')) return true;
  }

  return false;
}

/**
 * Get display name with Dr. prefix for doctoral graduates
 * @param namaLengkap - The full name
 * @param gelar - The academic title
 * @returns Display name with Dr. prefix if applicable
 */
export function getDisplayNameWithDr(namaLengkap: string | null | undefined, gelar: string | null | undefined): string {
  const nama = namaLengkap || '';
  const title = gelar || '';

  // If already has Dr. prefix, return as is
  if (nama.startsWith('Dr.') || title.startsWith('Dr.')) {
    return `${nama}${title ? `.${title}` : ''}`;
  }

  return `${nama}${title ? `.${title}` : ''}`;
}
