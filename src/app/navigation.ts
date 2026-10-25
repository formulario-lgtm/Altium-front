export type NavItem = {
  title: string;
  icon: string;
  /** Route name; visibility follows that route's `meta.permissions`. */
  routeName: string;
  description?: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { title: 'Inicio', icon: 'mdi-home-outline', routeName: 'home' },
  {
    title: 'Usuarios',
    icon: 'mdi-account-multiple-outline',
    routeName: 'users',
    description: 'Altas, roles y estado de las cuentas.',
  },
  {
    title: 'Equipos',
    icon: 'mdi-account-group-outline',
    routeName: 'teams',
    description: 'Supervisores y miembros de cada equipo.',
  },
  {
    title: 'Roles y permisos',
    icon: 'mdi-shield-key-outline',
    routeName: 'roles',
    description: 'Matriz de permisos por rol.',
  },
  {
    title: 'Auditoría',
    icon: 'mdi-history',
    routeName: 'audit',
    description: 'Registro de acciones relevantes.',
  },
];
