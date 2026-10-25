import { computed } from 'vue';
import { useRoute } from 'vue-router';

/** One-time token from `?token=` (activation / reset links). */
export function useTokenFromQuery() {
  const route = useRoute();
  const token = computed(() => {
    const raw = route.query.token;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  });
  return { token };
}
