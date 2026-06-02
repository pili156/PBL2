export const ROLES = {
  DOSEN: 'dosen',
  ADMIN: 'admin',
  ADMIN_FAKULTAS: 'admin_fakultas',
  MASTER_ADMIN: 'master_admin',
  KEUANGAN: 'keuangan',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
