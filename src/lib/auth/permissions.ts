export function canAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}
