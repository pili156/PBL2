import { cache } from 'react';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { prisma } from './prisma';
import { ROLE_DISPLAY } from '@/src/lib/constants/roles';

const ROLE_COOKIE_MAP: Record<string, string> = {
  dosen: 'token_dosen',
  admin: 'token_admin',
  master_admin: 'token_master_admin',
};

export interface UserLayoutData {
  email: string;
  name: string;
  nip?: string;
  role: string;
  roleDisplay: string;
  jabatan?: string;
  no_telp?: string;
}

async function getUserFromTokenImpl(role: string, fallbackRoles?: string[]): Promise<UserLayoutData> {
  const cookieStore = await cookies();

  const allAllowedRoles = [role, ...(fallbackRoles || [])];

  for (const [, cookieName] of Object.entries(ROLE_COOKIE_MAP)) {
    const token = cookieStore.get(cookieName)?.value;
    if (!token) continue;

    const payload = verifyToken(token);
    if (!payload) continue;
    if (!allAllowedRoles.includes(payload.role)) continue;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        master_dosen: {
          select: {
            nama_lengkap: true,
            nip: true,
            jabatan: true,
            no_telp: true,
          },
        },
      },
    });

    if (!user) continue;

    return {
      email: user.email || payload.email,
      name: user.master_dosen?.nama_lengkap || user.username || payload.nama,
      nip: user.master_dosen?.nip || undefined,
      role: payload.role,
      roleDisplay: ROLE_DISPLAY[payload.role] || payload.role,
      jabatan: user.master_dosen?.jabatan || undefined,
      no_telp: user.master_dosen?.no_telp || undefined,
    };
  }

  return {
    email: 'Guest',
    name: 'User',
    role,
    roleDisplay: ROLE_DISPLAY[role] || role,
  };
}

export const getUserFromToken = cache(getUserFromTokenImpl);
