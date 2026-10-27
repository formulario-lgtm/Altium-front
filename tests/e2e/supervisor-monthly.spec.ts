import { expect, test } from '@playwright/test';
import {
  mockApi,
  SUPERVISOR_PERMISSIONS,
  ADMINISTRATIVE_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  SELLER_PERMISSIONS,
} from './support/api-mock';
import { supervisorHomeFixture } from './support/home-api-mock';

for (const [role, permissions] of [
  ['SUPER_ADMIN', SUPER_ADMIN_PERMISSIONS],
  ['SUPERVISOR', SUPERVISOR_PERMISSIONS],
  ['SELLER', SELLER_PERMISSIONS],
] as const) {
  test(`monthly goals are hidden and direct access is blocked (${role})`, async ({ page }) => {
    await mockApi(page, { authenticated: true, roleCode: role, permissions: [...permissions] });
    const goalRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/supervision/goals')) goalRequests.push(request.url());
    });
    await page.goto('/supervision/goals');
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    await expect(page.getByTestId('supervision-goals')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Nuevo objetivo' })).toHaveCount(0);
    await page.goto('/');
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Objetivos', exact: true })).toHaveCount(0);
    await expect(page.getByText(/objetivo|cumplimiento/i)).toHaveCount(0);
    expect(goalRequests).toEqual([]);
  });
}

test('supervisor with administrative permissions still sees the monthly supervisor workspace', async ({
  page,
}) => {
  await mockApi(page, {
    authenticated: true,
    roleCode: 'SUPERVISOR',
    permissions: [...SUPERVISOR_PERMISSIONS, ...ADMINISTRATIVE_PERMISSIONS],
  });
  const administrativeCalls: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/home/administrative'))
      administrativeCalls.push(request.url());
  });
  await page.goto('/');
  const home = page.getByTestId('supervisor-home');
  await expect(home).toBeVisible();
  await expect(page.getByTestId('administrative-home')).toHaveCount(0);
  await expect(home.getByTestId('home-quick-actions').getByRole('link')).toHaveText([
    'Equipos',
    'Vendedores',
    'Administrativos',
  ]);
  const sellers = page.getByTestId('supervisor-sellers-panel');
  const admins = page.getByTestId('supervisor-administratives-panel');
  await expect(sellers.getByRole('row', { name: /Ana Pérez/ })).toContainText('8');
  await expect(sellers.getByRole('row', { name: /Total/ }).getByRole('cell')).toHaveText([
    'Total',
    '12',
    '3',
    '3',
    '3',
    '1',
    '2',
  ]);
  await expect(admins.getByRole('row', { name: /Total/ }).getByRole('cell')).toHaveText([
    'Total',
    '9',
    '5',
    '3',
    '4',
    '6',
  ]);
  await expect(sellers.locator('canvas')).toHaveCount(1);
  await expect(admins.locator('canvas')).toHaveCount(1);
  for (const panel of [sellers, admins]) {
    expect(
      await panel
        .locator('.v-table__wrapper')
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
  }
  expect(administrativeCalls).toEqual([]);
});

test('monthly supervisor data displays every person without truncating totals to a first page', async ({
  page,
}) => {
  await mockApi(page, {
    authenticated: true,
    roleCode: 'SUPERVISOR',
    permissions: SUPERVISOR_PERMISSIONS,
  });
  const data = supervisorHomeFixture();
  data.sellers = Array.from({ length: 12 }, (_, index) => ({
    ...data.sellers[0]!,
    sellerId: `person-${index}`,
    firstName: `Persona ${index + 1}`,
    lastName: 'Vendedora',
    salesPresented: 1,
    submitted: 1,
    inReview: 0,
    approved: 0,
    rejected: 0,
    returned: 0,
  }));
  data.sellerTotals = {
    salesPresented: 12,
    submitted: 12,
    inReview: 0,
    approved: 0,
    rejected: 0,
    returned: 0,
  };
  await page.route('**/api/v1/home/supervisor?*', (route) => route.fulfill({ json: data }));
  await page.goto('/');
  const panel = page.getByTestId('supervisor-sellers-panel');
  await expect(panel.getByRole('row')).toHaveCount(14);
  await expect(panel.getByRole('row', { name: /Persona 12/ })).toBeVisible();
});

test('mobile monthly panels expose every status without a sideways table', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page, {
    authenticated: true,
    roleCode: 'SUPERVISOR',
    permissions: SUPERVISOR_PERMISSIONS,
  });
  await page.goto('/');
  const sellers = page.getByTestId('supervisor-seller-mobile-metrics');
  const admins = page.getByTestId('supervisor-admin-mobile-metrics');
  await expect(sellers).toBeVisible();
  await expect(admins).toBeVisible();
  await expect(sellers).toContainText('por revisar');
  await expect(sellers).toContainText('en revisión');
  await expect(sellers).toContainText('aprobadas');
  await expect(sellers).toContainText('rechazadas');
  await expect(sellers).toContainText('devueltas');
  await expect(admins).toContainText('devoluciones');
  await expect(admins).toContainText('pendientes actuales');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
