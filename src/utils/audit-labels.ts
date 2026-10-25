/** Spanish labels for audit `action` codes (API codes stay English). */
const AUDIT_ACTION_LABELS: Readonly<Record<string, string>> = {
  'auth.login': 'Inicio de sesión',
  'auth.logout': 'Cierre de sesión',
  'auth.logout_all': 'Cierre de todas las sesiones',
  'auth.change_password': 'Cambio de contraseña',
  'auth.forgot_password': 'Solicitud de restablecimiento',
  'auth.reset_password': 'Restablecimiento de contraseña',
  'auth.activate': 'Activación de cuenta',
  'auth.session_revoked': 'Revocación de sesión',
  'user.create': 'Alta de usuario',
  'user.update': 'Actualización de usuario',
  'user.update_status': 'Cambio de estado de usuario',
  'user.delete': 'Baja de usuario',
  'user.password_reset_requested': 'Envío de enlace de contraseña',
  'team.create': 'Alta de equipo',
  'team.update': 'Actualización de equipo',
  'team.member_added': 'Alta de miembro de equipo',
  'team.member_removed': 'Baja de miembro de equipo',
  'role.update_permissions': 'Actualización de permisos de rol',
  'sale.create': 'Alta de venta',
  'sale.update': 'Actualización de venta',
  'sale.submit': 'Presentación de venta',
  'sale.return': 'Devolución de venta',
  'sale.access_denied': 'Acceso denegado a venta',
  'sale.document.upload': 'Subida de documento de venta',
  'sale.document.download': 'Descarga de documento de venta',
  'sale.document.delete': 'Eliminación de documento de venta',
};

export function auditActionLabel(action: string | null | undefined): string {
  if (!action) return '';
  return AUDIT_ACTION_LABELS[action] ?? action;
}
