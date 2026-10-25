import type { SettableUserStatus, User } from '@/services/http';

export const STATUS_ACTION_LABELS: Record<SettableUserStatus, string> = {
  ACTIVE: 'Reactivar',
  SUSPENDED: 'Suspender',
  DISABLED: 'Deshabilitar',
};

/** Statuses an admin can move a user to (PENDING users must activate first). */
export function availableStatusTargets(user: Pick<User, 'status'>): SettableUserStatus[] {
  const all: SettableUserStatus[] = ['ACTIVE', 'SUSPENDED', 'DISABLED'];
  return all.filter((status) => {
    if (status === user.status) return false;
    if (status === 'ACTIVE' && user.status === 'PENDING') return false;
    return true;
  });
}

/** Reset/activation links only apply to PENDING and ACTIVE accounts. */
export function canSendPasswordLink(user: Pick<User, 'status'>): boolean {
  return user.status === 'PENDING' || user.status === 'ACTIVE';
}
