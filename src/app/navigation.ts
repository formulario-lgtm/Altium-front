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
    title: 'Vendedores',
    icon: 'mdi-account-tie-outline',
    routeName: 'supervision-sellers',
    description: 'Rendimiento y cumplimiento de vendedores del equipo.',
  },
  {
    title: 'Administrativos',
    icon: 'mdi-briefcase-account-outline',
    routeName: 'supervision-administratives',
    description: 'Actividad y carga de trabajo administrativa.',
  },
  {
    title: 'Objetivos',
    icon: 'mdi-target',
    routeName: 'supervision-goals',
    description: 'Metas mensuales de equipos y personas.',
  },
  {
    title: 'Gestión de ventas',
    icon: 'mdi-clipboard-check-outline',
    routeName: 'admin-sales',
    description: 'Revisión y seguimiento de ventas presentadas.',
  },
  {
    title: 'Seguimientos',
    icon: 'mdi-calendar-clock',
    routeName: 'admin-follow-ups',
    description: 'Gestiones pendientes frente a la prepaga.',
  },
  {
    title: 'Mis ventas',
    icon: 'mdi-file-document-outline',
    routeName: 'sales',
    description: 'Borradores y ventas presentadas.',
  },
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
