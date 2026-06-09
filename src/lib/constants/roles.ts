export const ROLES = {
  DOSEN: 'dosen',
  ADMIN: 'admin',
  MASTER_ADMIN: 'master_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
