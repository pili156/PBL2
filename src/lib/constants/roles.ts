export const ROLES = {
  DOSEN: 'dosen',
  ADMIN: 'admin',
  MASTER_ADMIN: 'master_admin',
} as const;

export const ROLE_DISPLAY: Record<string, string> = {
  dosen: 'Dosen',
  admin: 'Admin',
  master_admin: 'Master Admin',
};

export type Role = (typeof ROLES)[keyof typeof ROLES];
