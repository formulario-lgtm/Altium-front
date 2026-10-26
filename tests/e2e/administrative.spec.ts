import { expect, test } from '@playwright/test';
import {
  ADMINISTRATIVE_PERMISSIONS,
  buildSale,
  mockApi,
  SELLER_PERMISSIONS,
} from './support/api-mock';

test.describe('Administrative UI', () => {
  for (const owner of ['self', 'other'] as const) {
    test(`shows the assigned administrative and hides assignment (${owner})`, async ({ page }) => {
      await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
      const sale = buildSale({ status: 'IN_REVIEW' });
      sale.administrativeAssignee =
        owner === 'self'
          ? sale.seller
          : { ...sale.seller, id: 'other-admin', firstName: 'Lucía', lastName: 'Administrativa' };
      await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
      await page.goto(`/administrative/sales/${sale.id}?section=contact`);
      await expect(page.getByTestId('sale-assignee')).toContainText(
        owner === 'self' ? 'Ana Pérez' : 'Lucía Administrativa',
      );
      await expect(
        page.getByRole('button', { name: 'Tomar responsabilidad', exact: true }),
      ).toHaveCount(0);
    });
  }

  test('an unassigned case can be claimed and then shows its responsible administrative', async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    let sale = buildSale({ status: 'IN_REVIEW' });
    await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
    await page.route(`**/api/v1/sales/${sale.id}/assignee`, (route) => {
      sale = { ...sale, version: 2, administrativeAssignee: sale.seller };
      return route.fulfill({ json: sale });
    });
    await page.goto(`/administrative/sales/${sale.id}?section=contact`);
    await expect(page.getByTestId('sale-assignee')).toContainText('Sin administrativo asignado');
    await page.getByRole('button', { name: 'Tomar responsabilidad', exact: true }).click();
    await expect(page.getByTestId('sale-assignee')).toContainText('Ana Pérez');
    await expect(
      page.getByRole('button', { name: 'Tomar responsabilidad', exact: true }),
    ).toHaveCount(0);
  });

  for (const missing of [false, true]) {
    test(`labels contact values in administrative review (${missing ? 'missing' : 'populated'})`, async ({
      page,
    }) => {
      await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
      const sale = buildSale(missing ? { contact: null } : {});
      await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
      await page.goto(`/administrative/sales/${sale.id}?section=contact`);
      const contact = page.getByTestId('admin-sale-contact');
      await expect(contact.locator('dt')).toHaveText([
        'Teléfono',
        'Correo electrónico',
        'Domicilio',
        'Código postal',
        'Provincia',
      ]);
      await expect(contact.locator('dd')).toHaveText(
        missing
          ? Array(5).fill('Sin completar')
          : ['11 55554444', 'ana.perez@altium.example', 'Calle Falsa 123', '1000', 'CABA'],
      );
    });
  }
  test('shows operational home and admin nav for ADMINISTRATIVE', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('administrative-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prioridades de hoy' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByRole('link', { name: 'Gestión de ventas', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Seguimientos', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Mis ventas' })).toHaveCount(0);
  });

  test('opens administrative sales queue and review', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    await page.goto('/administrative/sales');
    await expect(page.getByTestId('admin-sales-list')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gestión de ventas' })).toBeVisible();
    await page.goto('/administrative/sales/a1b2c3d4-3333-4000-8000-000000000003');
    await expect(page.getByTestId('admin-sale-review')).toBeVisible();
  });

  test('hides admin queue from sellers', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/administrative/sales');
    await expect(page).toHaveURL(/forbidden|sales/);
  });

  test('shows notifications control when permitted', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/sales');
    await expect(page.getByTestId('notifications-menu')).toBeVisible();
  });
});
