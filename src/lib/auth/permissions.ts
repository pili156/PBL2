import { ROLES } from "@/src/lib/constants/roles";

export function hasRole(userRole: string, targetRole: string): boolean {
  return userRole === targetRole;
}

export function hasAnyRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccess(userRole: string, allowedRoles: string[]): boolean {
  return hasAnyRole(userRole, allowedRoles);
}
