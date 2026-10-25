import { expect, test } from '@playwright/test';
import { ADMINISTRATIVE_PERMISSIONS, mockApi, SELLER_PERMISSIONS } from './support/api-mock';

test.describe('Administrative UI', () => {
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
