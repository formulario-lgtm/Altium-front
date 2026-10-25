/** Spanish display labels for system role codes (codes stay English in the API). */
export const ROLE_LABELS: Readonly<Record<string, string>> = {
  SUPER_ADMIN: 'Super administrador',
  SUPERVISOR: 'Supervisor',
  ADMINISTRATIVE: 'Administrativo',
  SELLER: 'Vendedor',
};

export function roleLabel(code: string | null | undefined): string {
  if (!code) return '';
  return ROLE_LABELS[code] ?? code;
}
