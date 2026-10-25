import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { currentBusinessYearMonth } from '../utils/supervision-labels';

/** Shared year/month/teamId filters synced to the route query. */
export function useSupervisionPeriod() {
  const route = useRoute();
  const router = useRouter();
  const now = currentBusinessYearMonth();

  const year = ref(Number(route.query.year) || now.year);
  const month = ref(Number(route.query.month) || now.month);
  const teamId = ref<string | null>(
    typeof route.query.teamId === 'string' && route.query.teamId ? route.query.teamId : null,
  );

  const periodQuery = computed(() => ({
    year: year.value,
    month: month.value,
    ...(teamId.value ? { teamId: teamId.value } : {}),
  }));

  watch(
    [year, month, teamId],
    () => {
      void router.replace({
        query: {
          ...route.query,
          year: String(year.value),
          month: String(month.value),
          ...(teamId.value ? { teamId: teamId.value } : { teamId: undefined }),
        },
      });
    },
    { flush: 'post' },
  );

  watch(
    () => route.query,
    (q) => {
      if (q.year) year.value = Number(q.year) || year.value;
      if (q.month) month.value = Number(q.month) || month.value;
      teamId.value = typeof q.teamId === 'string' && q.teamId ? q.teamId : null;
    },
  );

  return { year, month, teamId, periodQuery };
}
