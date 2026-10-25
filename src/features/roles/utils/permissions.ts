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

/** Spanish labels for permission `resource` groups (codes stay English in the API). */
export const RESOURCE_LABELS: Record<string, string> = {
  users: 'Usuarios',
  teams: 'Equipos',
  roles: 'Roles',
  permissions: 'Permisos',
  auth: 'Sesiones y acceso',
  audit: 'Auditoría',
  sales: 'Ventas',
  administrative: 'Administrativo',
  supervision: 'Supervisión',
  notifications: 'Notificaciones',
  home: 'Inicio',
};

const RESOURCE_ORDER = [
  'users',
  'teams',
  'roles',
  'permissions',
  'auth',
  'audit',
  'sales',
  'administrative',
  'supervision',
  'notifications',
  'home',
] as const;

export type PermissionGroup = {
  resource: string;
  label: string;
  items: Permission[];
};

export function resourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
}

export function groupPermissionsByResource(permissions: readonly Permission[]): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const list = groups.get(permission.resource) ?? [];
    list.push(permission);
    groups.set(permission.resource, list);
  }

  const orderedKeys = [
    ...RESOURCE_ORDER.filter((key) => groups.has(key)),
    ...[...groups.keys()]
      .filter((key) => !(RESOURCE_ORDER as readonly string[]).includes(key))
      .sort(),
  ];

  return orderedKeys.map((resource) => ({
    resource,
    label: resourceLabel(resource),
    items: [...(groups.get(resource) ?? [])].sort((a, b) => a.code.localeCompare(b.code)),
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
