import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from './prisma';

const ROLE_COOKIE_MAP: Record<string, string> = {
  dosen: 'token_dosen',
  admin_fakultas: 'token_admin_fakultas',
  master_admin: 'token_master_admin',
  keuangan: 'token_keuangan',
};

export interface UserLayoutData {
  email: string;
  name: string;
  nip?: string;
  role: string;
  roleDisplay: string;
  unitKerja?: string;
  jabatan?: string;
}

const ROLE_DISPLAY_MAP: Record<string, string> = {
  dosen: 'Dosen',
  admin_fakultas: 'Admin',
  master_admin: 'Master Admin',
  keuangan: 'Keuangan',
};

export async function getUserFromToken(role: string): Promise<UserLayoutData> {
  const cookieStore = await cookies();
  const cookieName = ROLE_COOKIE_MAP[role];
  const token = cookieStore.get(cookieName)?.value;

  const defaults: UserLayoutData = {
    email: 'Guest',
    name: 'User',
    role,
    roleDisplay: ROLE_DISPLAY_MAP[role] || role,
  };

  if (!token) return defaults;

  const payload = verifyToken(token);
  if (!payload) return defaults;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      master_dosen: {
        select: {
          nama_lengkap: true,
          nip: true,
          unit_kerja: true,
          jabatan: true,
        },
      },
    },
  });

  if (!user) return defaults;

  return {
    email: user.email || payload.email,
    name: user.master_dosen?.nama_lengkap || user.username || payload.nama,
    nip: user.master_dosen?.nip || undefined,
    role,
    roleDisplay: ROLE_DISPLAY_MAP[role] || role,
    unitKerja: user.master_dosen?.unit_kerja || undefined,
    jabatan: user.master_dosen?.jabatan || undefined,
  };
}
