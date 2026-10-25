import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { currentBusinessYearMonth } from '@/features/supervision/utils/supervision-labels';

type Options = {
  /** When false, period stays locked to current BA month (seller / administrative). */
  allowPastMonths?: boolean;
  /** Sync year/month/teamId to the route query. */
  syncRoute?: boolean;
  enableTeam?: boolean;
};

/** Year/month/(optional team) for home queries. Defaults to current BA calendar month. */
export function useHomePeriod(options: Options = {}) {
  const allowPastMonths = options.allowPastMonths ?? true;
  const syncRoute = options.syncRoute ?? allowPastMonths;
  const enableTeam = options.enableTeam ?? false;

  const route = useRoute();
  const router = useRouter();
  const now = currentBusinessYearMonth();

  const year = ref(
    allowPastMonths && syncRoute && route.query.year
      ? Number(route.query.year) || now.year
      : now.year,
  );
  const month = ref(
    allowPastMonths && syncRoute && route.query.month
      ? Number(route.query.month) || now.month
      : now.month,
  );
  const teamId = ref<string | null>(
    enableTeam && typeof route.query.teamId === 'string' && route.query.teamId
      ? route.query.teamId
      : null,
  );

  const periodQuery = computed(() => ({
    year: year.value,
    month: month.value,
    ...(enableTeam && teamId.value ? { teamId: teamId.value } : {}),
  }));

  if (syncRoute && allowPastMonths) {
    watch(
      [year, month, teamId],
      () => {
        void router.replace({
          query: {
            ...route.query,
            year: String(year.value),
            month: String(month.value),
            ...(enableTeam
              ? teamId.value
                ? { teamId: teamId.value }
                : { teamId: undefined }
              : {}),
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
        if (enableTeam) {
          teamId.value = typeof q.teamId === 'string' && q.teamId ? q.teamId : null;
        }
      },
    );
  }

  return { year, month, teamId, periodQuery, allowPastMonths, enableTeam };
}
