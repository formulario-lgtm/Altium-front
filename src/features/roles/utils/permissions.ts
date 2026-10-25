import type { Permission } from '@/services/http';

/** From the `PUT /roles/{id}/permissions` contract: SUPER_ADMIN must keep these. */
export const PROTECTED_SUPER_ADMIN_PERMISSIONS: readonly string[] = [
  'users.create',
  'users.update_status',
  'roles.update_permissions',
  'roles.read',
  'permissions.read',
  'audit.read',
];

export const SUPER_ADMIN_ROLE_CODE = 'SUPER_ADMIN';

export type PermissionGroup = { resource: string; items: Permission[] };

export function groupPermissionsByResource(permissions: readonly Permission[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const list = groups.get(permission.resource) ?? [];
    list.push(permission);
    groups.set(permission.resource, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([resource, items]) => ({
      resource,
      items: [...items].sort((a, b) => a.code.localeCompare(b.code)),
    }));
}

export function isProtectedPermission(roleCode: string, permissionCode: string): boolean {
  return (
    roleCode === SUPER_ADMIN_ROLE_CODE && PROTECTED_SUPER_ADMIN_PERMISSIONS.includes(permissionCode)
  );
}

export function sameCodes(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((code) => set.has(code));
}
