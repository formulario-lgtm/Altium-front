import { expect, test } from '@playwright/test';
import {
  ADMINISTRATIVE_PERMISSIONS,
  mockApi,
  SELLER_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  SUPERVISOR_PERMISSIONS,
} from './support/api-mock';

test.describe('Home by role', () => {
  test('seller home shows KPIs and attention block', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('seller-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Requiere tu atención' })).toBeVisible();
    await expect(page.getByTestId('home-quick-actions')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva venta' })).toBeVisible();
    await expect(page.getByText('Mis sesiones')).toHaveCount(0);
    await expect(page.getByText('Estado del sistema')).toHaveCount(0);
  });

  test('administrative home shows priorities', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('administrative-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prioridades de hoy' })).toBeVisible();
  });

  test('supervisor home shows period filters', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('supervisor-home')).toBeVisible();
    await expect(page.getByTestId('home-period-filters')).toBeVisible();
  });

  test('super admin home is executive', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPER_ADMIN_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('admin-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pendientes y riesgos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accesos rápidos' })).toBeVisible();
  });

  test('fallback home without home.* permissions', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ['teams.read'] });
    await page.goto('/');
    await expect(page.getByTestId('fallback-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
  });
});
