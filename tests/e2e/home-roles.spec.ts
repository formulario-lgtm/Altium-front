import { expect, test } from '@playwright/test';
import type { components } from '../../src/types/generated/api';
import {
  mockApi,
  ADMINISTRATIVE_PERMISSIONS,
  SUPERVISOR_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from './support/api-mock';
import {
  administrativeHomeFixture,
  supervisorHomeFixture,
  adminHomeFixture,
} from './support/home-api-mock';

type Role = 'administrative' | 'supervisor' | 'admin';
const TEAM_ID = 'a1b2c3d4-5555-4000-8000-000000000005';
const roles = [
  {
    role: 'administrative',
    permissions: ADMINISTRATIVE_PERMISSIONS,
    first: 'administrative-priorities',
    second: 'administrative-follow-ups',
    primary: 'Gestión de ventas',
  },
  {
    role: 'supervisor',
    permissions: SUPERVISOR_PERMISSIONS,
    first: 'supervisor-priorities',
    second: 'supervisor-progress',
    primary: 'Vendedores',
  },
  {
    role: 'admin',
    permissions: SUPER_ADMIN_PERMISSIONS,
    first: 'admin-priorities',
    second: 'admin-security',
    primary: 'Gestión de ventas',
  },
] as const;

function fixture(role: Role, empty = false) {
  if (role === 'administrative') {
    const home = administrativeHomeFixture();
    home.upcomingFollowUps = [
      {
        id: 'follow-up-1',
        saleId: home.attentionQueue[0]!.id,
        saleNumber: 'V-000001',
        description: 'Confirmar documentación pendiente',
        nextFollowUpAt: '2026-10-26T12:00:00.000Z',
      },
    ];
    if (empty) {
      home.attentionQueue = [];
      home.upcomingFollowUps = [];
      home.alerts = [];
      home.activityLast7Days = [];
    }
    return home;
  }
  if (role === 'supervisor') {
    const home = supervisorHomeFixture();
    if (empty) {
      home.sellersBehindPace = [];
      home.dailyPresented = [];
      home.alerts = [];
      home.compliance = {
        hasGoal: false,
        targetIsZero: false,
        targetValue: null,
        compliancePercent: null,
      };
    }
    return home;
  }
  const home = adminHomeFixture();
  home.recentSecurityEvents = [
    {
      id: 'event-1',
      action: 'auth.login',
      entityType: 'session',
      entityId: null,
      occurredAt: '2026-10-25T12:00:00.000Z',
      outcome: 'SUCCESS',
    },
  ];
  if (empty) {
    home.recentSecurityEvents = [];
    home.alerts = [];
    home.monthlyPresented = [];
    home.teamPerformance = [];
    home.followUpsOverdue = 0;
    home.staleSubmitted = 0;
    home.teamsWithoutGoal = 0;
    home.usersPendingActivation = 0;
    home.usersSuspended = 0;
    home.comparableCompliance = {
      hasGoal: false,
      targetIsZero: false,
      targetValue: null,
      compliancePercent: null,
    };
  }
  return home;
}

test.describe('Operational role homes', () => {
  test('admin lists allow repeated destinations without Vuetify or chart warnings', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (
        ['warning', 'error'].includes(message.type()) &&
        /Multiple nodes with the same ID|containLabel|LegacyGridContainLabel/.test(message.text())
      )
        warnings.push(message.text());
    });
    await mockApi(page, { authenticated: true, permissions: SUPER_ADMIN_PERMISSIONS });
    const home = adminHomeFixture();
    home.recentSecurityEvents = Array.from({ length: 10 }, (_, index) => ({
      id: `event-${index}`,
      action: 'auth.login',
      entityType: 'session',
      entityId: null,
      occurredAt: '2026-10-25T12:00:00.000Z',
      outcome: 'SUCCESS',
    }));
    await page.route('**/api/v1/home/admin?*', (route) => route.fulfill({ json: home }));
    await page.goto('/');
    await expect(page.getByTestId('home-security-events').getByRole('link')).toHaveCount(10);
    await expect(
      page.getByTestId('admin-operations').getByRole('link', { name: /activación|suspendidas/ }),
    ).toHaveCount(2);
    await expect(page.getByTestId('admin-home').locator('canvas')).toHaveCount(2);
    expect(warnings).toEqual([]);
  });
  for (const config of roles) {
    for (const mobile of [false, true]) {
      for (const light of [false, true]) {
        test(`${config.role}, populated, ${mobile ? 'mobile' : 'desktop'}, ${light ? 'light' : 'dark'}`, async ({
          page,
        }, testInfo) => {
          await page.setViewportSize(
            mobile ? { width: 390, height: 844 } : { width: 1440, height: 1100 },
          );
          await mockApi(page, { authenticated: true, permissions: [...config.permissions] });
          await page.route(`**/api/v1/home/${config.role}?*`, (route) =>
            route.fulfill({ json: fixture(config.role) }),
          );
          await page.goto('/?year=2026&month=10');
          if (light) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
          const home = page.getByTestId(`${config.role}-home`);
          await expect(
            home
              .getByTestId('home-quick-actions')
              .first()
              .getByRole('link', { name: config.primary, exact: true }),
          ).toBeVisible();
          await expect(page.getByTestId(config.first)).toBeVisible();
          await expect(page.getByTestId(config.second)).toBeVisible();
          if (mobile) {
            const first = await home.getByTestId('home-kpi-card').nth(0).boundingBox();
            const second = await home.getByTestId('home-kpi-card').nth(1).boundingBox();
            expect(first?.y).toBe(second?.y);
          } else {
            const first = await page.getByTestId(config.first).boundingBox();
            const second = await page.getByTestId(config.second).boundingBox();
            expect(first).not.toBeNull();
            expect(second).not.toBeNull();
            expect(Math.abs(first!.height - second!.height)).toBeLessThanOrEqual(1);
            expect(first!.y).toBe(second!.y);
          }
          if (config.role === 'admin') {
            await expect(home.getByRole('combobox', { name: 'Equipo', exact: true })).toHaveCount(
              0,
            );
            await expect(
              home.getByRole('heading', { name: 'Ventas presentadas · Últimos 6 meses' }),
            ).toBeVisible();
            await expect(
              home.getByTestId('home-security-events').getByText('Inicio de sesión'),
            ).toBeVisible();
            await expect(home.getByTestId('home-security-events').getByText('Éxito')).toBeVisible();
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          ).toBe(true);
          await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
        });
      }
    }

    for (const mobile of [false, true]) {
      test(`${config.role}, empty, ${mobile ? 'mobile light' : 'desktop dark'}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize(
          mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        );
        await mockApi(page, { authenticated: true, permissions: [...config.permissions] });
        await page.route(`**/api/v1/home/${config.role}?*`, (route) =>
          route.fulfill({ json: fixture(config.role, true) }),
        );
        if (config.role === 'supervisor') {
          const empty: components['schemas']['SellerListResponseDto'] = { items: [] };
          await page.route('**/api/v1/supervision/sellers?*', (route) =>
            route.fulfill({ json: empty }),
          );
        }
        await page.goto('/');
        if (mobile) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
        const home = page.getByTestId(`${config.role}-home`);
        await expect(home).toBeVisible();
        await expect(home.locator('canvas')).toHaveCount(0);
        if (config.role === 'administrative') {
          await expect(home.getByText('Tu cola está al día')).toBeVisible();
          await expect(home.getByText('Sin alertas operativas')).toBeVisible();
        } else {
          await expect(
            home.getByTestId('home-goal-progress').getByText('Sin objetivo', { exact: true }),
          ).toBeVisible();
          await expect(home.getByRole('progressbar')).toHaveCount(0);
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
      });
    }
  }

  test('administrative work links open the review and follow-up section', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    await page.route('**/api/v1/home/administrative?*', (route) =>
      route.fulfill({ json: fixture('administrative') }),
    );
    await page.goto('/');
    await expect(
      page.getByTestId('administrative-priorities').getByRole('link', { name: /Venta 1.*Revisar/ }),
    ).toHaveAttribute('href', /\/administrative\/sales\/.+$/);
    await page.getByTestId('home-follow-up-list').getByRole('link').click();
    await expect(page).toHaveURL(/section=followUps/);
  });

  test('supervisor keeps period and team when opening a seller, without forbidden management links', async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto(`/?year=2026&month=9&teamId=${TEAM_ID}`);
    await expect(
      page
        .getByTestId('supervisor-home')
        .getByRole('button', { name: /Pendientes de gestión admin/ }),
    ).toHaveCount(0);
    await page.getByTestId('home-seller-pace-list').getByRole('link').first().click();
    await expect(page).toHaveURL(/\/supervision\/sellers\/.+\?/);
    const url = new URL(page.url());
    expect(url.searchParams.get('year')).toBe('2026');
    expect(url.searchParams.get('month')).toBe('9');
    expect(url.searchParams.get('teamId')).toBe(TEAM_ID);
  });

  test('admin counters provide direct destinations and avoid repeated alerts', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPER_ADMIN_PERMISSIONS });
    await page.goto('/');
    const operations = page.getByTestId('admin-operations');
    await expect(operations.getByRole('link', { name: /Presentadas demoradas/ })).toHaveAttribute(
      'href',
      '/administrative/sales?status=SUBMITTED',
    );
    await expect(page.getByTestId('admin-home').getByTestId('home-alert-list')).toHaveCount(0);
    await operations.getByRole('link', { name: /Pendientes de activación/ }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test('administrative retains extra alerts and restores review warnings when the queue is empty', async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    const home = administrativeHomeFixture();
    home.alerts.push({
      code: 'OVERDUE_FOLLOW_UPS',
      title: 'Seguimientos vencidos',
      description: 'Hay gestiones que necesitan seguimiento.',
      severity: 'warning',
      count: 3,
    });
    await page.route('**/api/v1/home/administrative?*', (route) => route.fulfill({ json: home }));
    await page.goto('/');
    const alerts = page.getByTestId('home-alert-list');
    await expect(alerts.getByText('Seguimientos vencidos')).toBeVisible();
    await expect(alerts.getByText('Presentadas pendientes')).toHaveCount(0);
    home.attentionQueue = [];
    await page.reload();
    await expect(alerts.getByText('Presentadas pendientes')).toBeVisible();
  });

  for (const state of ['zero', 'unavailable', 'exceeded'] as const) {
    test(`supervisor goal ${state} shows honest progress`, async ({ page }) => {
      await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
      const home = supervisorHomeFixture();
      home.compliance = {
        hasGoal: true,
        targetIsZero: state === 'zero',
        targetValue: state === 'zero' ? 0 : 10,
        compliancePercent: state === 'exceeded' ? 160 : null,
      };
      await page.route('**/api/v1/home/supervisor?*', (route) => route.fulfill({ json: home }));
      await page.goto('/');
      const progress = page.getByTestId('home-goal-progress');
      await expect(
        progress.getByText(
          state === 'zero' ? 'Objetivo en cero' : state === 'unavailable' ? 'Sin datos' : '160%',
          { exact: true },
        ),
      ).toBeVisible();
      if (state === 'exceeded')
        await expect(progress.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
      else await expect(progress.getByRole('progressbar')).toHaveCount(0);
    });
  }

  test('supervisor comparison reports an independent error and can retry', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    let fail = true;
    await page.route('**/api/v1/supervision/sellers?*', (route) =>
      fail
        ? route.fulfill({
            status: 503,
            contentType: 'application/problem+json',
            json: {
              type: 'about:blank',
              title: 'Servicio no disponible',
              status: 503,
              detail: 'No se pudo cargar la comparación.',
            },
          })
        : route.fulfill({
            json: { items: [] } satisfies components['schemas']['SellerListResponseDto'],
          }),
    );
    await page.goto('/');
    await expect(page.getByTestId('supervisor-priorities')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    fail = false;
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(
      page.getByText('No hay vendedores con un objetivo y cumplimiento disponible para comparar.'),
    ).toBeVisible();
  });
});
