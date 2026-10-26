import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { accessibleHomeRoute, withHomePeriod } from './home-navigation';

describe('home drill-down navigation', () => {
  it('keeps existing filters and adds the selected period and team', () => {
    expect(
      withHomePeriod(
        { name: 'supervision-sellers', query: { page: '2' } },
        { year: 2026, month: 9, teamId: 'team-1' },
      ),
    ).toEqual({
      name: 'supervision-sellers',
      query: { page: '2', year: 2026, month: 9, teamId: 'team-1' },
    });
    expect(withHomePeriod(null, { year: 2026 })).toBeNull();
  });

  it('keeps a KPI informational when the management route requires another permission', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          name: 'admin-sales',
          path: '/administrative/sales',
          component: {},
          meta: { permissions: ['sales.review'] },
        },
      ],
    });
    const destination = { name: 'admin-sales' };
    expect(
      accessibleHomeRoute(router, destination, (code) => code === 'supervision.analytics.read'),
    ).toBeNull();
    expect(accessibleHomeRoute(router, destination, (code) => code === 'sales.review')).toEqual(
      destination,
    );
  });
});
