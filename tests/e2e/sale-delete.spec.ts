import { expect, test, type Page } from '@playwright/test';
import type { Sale } from '../../src/services/http';
import {
  buildSale,
  CSRF_TOKEN,
  mockApi,
  SELLER_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from './support/api-mock';

async function setup(
  page: Page,
  options: { role?: string; sale?: Partial<Sale>; permissions?: string[] } = {},
) {
  await mockApi(page, {
    authenticated: true,
    roleCode: options.role ?? 'SELLER',
    permissions: options.permissions ?? SELLER_PERMISSIONS,
  });
  const sale = buildSale(options.sale);
  const state = { deleted: false, deletes: 0, conflict: false };
  await page.route(/\/api\/v1\/sales(?:\?.*)?$/, (route) =>
    route.fulfill({
      json: {
        items: state.deleted ? [] : [sale],
        pageInfo: { limit: 25, offset: 0, total: state.deleted ? 0 : 1, hasNextPage: false },
      },
    }),
  );
  await page.route(`**/api/v1/sales/${sale.id}`, async (route) => {
    if (route.request().method() === 'DELETE') {
      state.deletes++;
      expect(route.request().headers()['x-csrf-token']).toBe(CSRF_TOKEN);
      if (state.conflict)
        return route.fulfill({
          status: 409,
          json: {
            type: 'about:blank',
            title: 'Conflict',
            status: 409,
            code: 'CONFLICT',
            detail: 'La venta ya fue presentada. Actualizá la pantalla.',
          },
        });
      state.deleted = true;
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ json: sale });
  });
  return { sale, state };
}

for (const mobile of [false, true]) {
  test(`seller can cancel then delete an own draft from its detail (${mobile ? 'mobile' : 'desktop'})`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    const { sale, state } = await setup(page);
    await page.goto(`/sales/${sale.id}`);
    const button = page.getByRole('button', { name: 'Borrar venta 1', exact: true });
    await button.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('¿Querés borrar la venta 1?');
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click();
    expect(state.deletes).toBe(0);
    await button.click();
    await dialog.getByRole('button', { name: 'Borrar venta', exact: true }).click();
    await expect(page).toHaveURL(/\/sales$/);
    await expect(page.getByText('No hay ventas', { exact: true })).toBeVisible();
    expect(state.deletes).toBe(1);
  });
}

test('deleting from the list refreshes it and failures remain visible for retry', async ({
  page,
}) => {
  const { state } = await setup(page);
  await page.goto('/sales');
  await page.getByRole('button', { name: 'Borrar venta 1', exact: true }).click();
  state.conflict = true;
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Borrar venta', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('La venta ya fue presentada.');
  expect(state.deleted).toBe(false);
  state.conflict = false;
  await dialog.getByRole('button', { name: 'Borrar venta', exact: true }).click();
  await expect(page.getByText('No hay ventas', { exact: true })).toBeVisible();
  expect(state.deletes).toBe(2);
});

for (const status of ['SUBMITTED', 'IN_REVIEW', 'RETURNED', 'APPROVED', 'REJECTED'] as const) {
  test(`seller cannot delete a ${status} sale`, async ({ page }) => {
    const { sale } = await setup(page, { sale: { status } });
    await page.goto(`/sales/${sale.id}`);
    await expect(page.getByRole('heading', { name: 'Venta 1', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Borrar venta 1', exact: true })).toHaveCount(0);
    await page.goto('/sales');
    await expect(page.getByTestId('sales-table')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Borrar venta 1', exact: true })).toHaveCount(0);
  });
}
for (const role of ['ADMINISTRATIVE', 'SUPERVISOR', 'SUPER_ADMIN']) {
  test(`${role} cannot delete even with sales.update and matching owner`, async ({ page }) => {
    const { sale } = await setup(page, { role, permissions: SUPER_ADMIN_PERMISSIONS });
    await page.goto(`/sales/${sale.id}`);
    await expect(page.getByRole('heading', { name: 'Venta 1', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Borrar venta 1', exact: true })).toHaveCount(0);
  });
}

test('another owner or a draft with submittedAt cannot expose deletion', async ({ page }) => {
  const { sale } = await setup(page, {
    sale: { seller: { ...buildSale().seller, id: 'other-seller' } },
  });
  await page.goto(`/sales/${sale.id}`);
  await expect(page.getByRole('heading', { name: 'Venta 1', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Borrar venta 1', exact: true })).toHaveCount(0);
  await setup(page, { sale: { submittedAt: '2026-10-27T12:00:00Z' } });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Venta 1', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Borrar venta 1', exact: true })).toHaveCount(0);
});
