import { expect, test } from '@playwright/test';
import { mockApi, SELLER_PERMISSIONS, SUPERVISOR_PERMISSIONS } from './support/api-mock';

test.describe('Supervision UI', () => {
  test('shows supervisor home and nav for SUPERVISOR', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('supervisor-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vendedores bajo ritmo' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByRole('link', { name: 'Vendedores', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Administrativos', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Objetivos', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Gestión de ventas' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Mis ventas' })).toHaveCount(0);
  });

  test('updates period filters on supervisor home', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto('/?year=2026&month=9');
    await expect(page.getByTestId('supervisor-home')).toBeVisible();
    await expect(page.getByTestId('home-period-filters')).toBeVisible();
    await expect(page).toHaveURL(/month=9/);
    await expect(page.getByRole('combobox', { name: 'Mes' })).toHaveValue('Septiembre');
  });

  test('lists sellers and opens detail', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto('/supervision/sellers');
    await expect(page.getByTestId('supervision-sellers')).toBeVisible();
    await expect(page.getByText('Pérez, Ana')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Sin objetivo', exact: true })).toBeVisible();
    await page
      .getByRole('row', { name: /Pérez, Ana/ })
      .getByRole('button', { name: 'Ver' })
      .click();
    await expect(page.getByTestId('supervision-seller-detail')).toBeVisible();
  });

  test('lists administrativas and goals', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto('/supervision/administratives');
    await expect(page.getByTestId('supervision-administratives')).toBeVisible();
    await expect(page.getByText('López, María')).toBeVisible();
    await page.goto('/supervision/goals');
    await expect(page.getByTestId('supervision-goals')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nuevo objetivo' })).toBeVisible();
  });

  test('denies supervision routes without permission', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/supervision/sellers');
    await expect(page).toHaveURL(/forbidden|sales/);
  });
});
