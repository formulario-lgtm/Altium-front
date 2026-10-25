/** Spanish labels for audit / domain `entityType` codes. */
const ENTITY_TYPE_LABELS: Readonly<Record<string, string>> = {
  user: 'Usuario',
  team: 'Equipo',
  role: 'Rol',
  sale: 'Venta',
  sale_document: 'Documento de venta',
  session: 'Sesión',
};

export function entityTypeLabel(value: string | null | undefined): string {
  if (!value) return '';
  return ENTITY_TYPE_LABELS[value] ?? value;
}
