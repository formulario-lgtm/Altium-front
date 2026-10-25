import { expect, test } from '@playwright/test';
import {
  ADMINISTRATIVE_PERMISSIONS,
  mockApi,
  SELLER_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
} from './support/api-mock';

test.describe('sales module', () => {
  test('seller navigation shows Mis ventas and hides admin entries', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByText('Mis ventas')).toBeVisible();
    await expect(nav.getByText('Usuarios')).toHaveCount(0);
    await expect(nav.getByText('Equipos')).toHaveCount(0);
    await expect(nav.getByText('Roles y permisos')).toHaveCount(0);
    await expect(nav.getByText('Auditoría')).toHaveCount(0);

    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible();
  });

  test('Mis ventas lists mocked sales with filters and actions', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/sales');

    const table = page.getByTestId('sales-table');
    await expect(page.getByRole('heading', { name: 'Mis ventas' })).toBeVisible();
    await expect(table.getByText('V-000001')).toBeVisible();
    await expect(table.getByText('Pérez, Ana')).toBeVisible();
    await expect(table.getByText('Borrador')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva venta' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Buscar número o titular' }).fill('Pérez');
    await expect(table.getByText('V-000001')).toBeVisible();
  });

  test('creates a draft and opens the editable form', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/sales/new');

    await expect(page).toHaveURL(/\/sales\/[0-9a-f-]{36}\/edit$/i);
    await expect(page.getByRole('heading', { name: 'Datos de la venta' })).toBeVisible();
    await expect(page.getByText('Guardado').or(page.getByText('Cambios pendientes'))).toBeVisible({
      timeout: 10_000,
    });
  });

  test('theme toggle remains available for sellers', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/sales');

    const toggle = page.getByRole('button', { name: /Cambiar a tema/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('button', { name: /Cambiar a tema/i })).toBeVisible();
  });

  test('seller sees Presentar (sales.update) and not Devolver', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/sales/a1b2c3d4-3333-4000-8000-000000000003');
    await expect(page.getByRole('button', { name: 'Presentar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Devolver' })).toHaveCount(0);
  });

  test('user with sales.return sees Devolver on a submitted sale', async ({ page }) => {
    await mockApi(page, {
      authenticated: true,
      permissions: [...SUPER_ADMIN_PERMISSIONS, ...ADMINISTRATIVE_PERMISSIONS],
    });

    await page.route(/\/api\/v1\/sales\/a1b2c3d4-3333-4000-8000-000000000003$/, async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      const origin = route.request().headers()['origin'] ?? '*';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
        },
        body: JSON.stringify({
          id: 'a1b2c3d4-3333-4000-8000-000000000003',
          saleNumber: 'V-000001',
          version: 2,
          status: 'SUBMITTED',
          customerType: 'DEREGULATED',
          observations: null,
          createdAt: '2026-10-20T10:00:00.000Z',
          updatedAt: '2026-10-24T18:00:00.000Z',
          submittedAt: '2026-10-24T18:00:00.000Z',
          healthInsurer: {
            id: 'a1b2c3d4-1111-4000-8000-000000000001',
            code: 'PREVENCION_SALUD',
            name: 'Prevención Salud',
          },
          healthPlan: {
            id: 'a1b2c3d4-2222-4000-8000-000000000002',
            code: 'A1',
            name: 'Plan A1',
          },
          seller: {
            id: '6f9619ff-8b86-4d01-b42d-00c04fc964ff',
            email: 'ana.perez@altium.example',
            firstName: 'Ana',
            lastName: 'Pérez',
          },
          members: [],
          contact: null,
          employment: null,
          taxInfo: null,
          billing: null,
        }),
      });
    });

    await page.goto('/sales/a1b2c3d4-3333-4000-8000-000000000003');
    await expect(page.getByRole('button', { name: 'Devolver' })).toBeVisible();
  });

  test('version conflict shows recovery action on edit', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });

    await page.route(/\/api\/v1\/sales\/a1b2c3d4-3333-4000-8000-000000000003$/, async (route) => {
      if (route.request().method() !== 'PATCH') {
        await route.fallback();
        return;
      }
      const origin = route.request().headers()['origin'] ?? '*';
      await route.fulfill({
        status: 409,
        contentType: 'application/problem+json',
        headers: {
          'access-control-allow-origin': origin,
          'access-control-allow-credentials': 'true',
        },
        body: JSON.stringify({
          type: 'about:blank',
          title: 'Conflict',
          status: 409,
          detail: 'Version conflict',
          code: 'VERSION_CONFLICT',
          requestId: 'req_e2e_conflict',
        }),
      });
    });

    await page.goto('/sales/a1b2c3d4-3333-4000-8000-000000000003/edit');
    await expect(page.getByRole('heading', { name: 'Datos de la venta' })).toBeVisible();

    const sectionNav = page.getByRole('navigation', { name: 'Secciones de la venta' });
    if (await sectionNav.isVisible()) {
      await sectionNav.getByText('Observaciones').click();
    } else {
      await page.getByLabel('Sección').click();
      await page.getByRole('option', { name: 'Observaciones' }).click();
    }

    await page.getByLabel('Observaciones').fill('conflicto-version-e2e');
    await page.getByRole('button', { name: 'Guardar borrador' }).click();

    await expect(page.getByText('Conflicto de versión')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recuperar versión actual' })).toBeVisible();
  });
});
