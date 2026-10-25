import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { NAV_ITEMS, type NavItem } from '@/app/navigation';
import { useAuthStore } from '@/stores/auth.store';

/** Navigation entries the current user may open (derived from route `meta.permissions`). */
export function useNavigationItems() {
  const router = useRouter();
  const auth = useAuthStore();

  const items = computed<NavItem[]>(() =>
    NAV_ITEMS.filter((item) => {
      const required = router.resolve({ name: item.routeName }).meta.permissions ?? [];
      return auth.hasAllPermissions(required);
    }),
  );

  return { items };
}
