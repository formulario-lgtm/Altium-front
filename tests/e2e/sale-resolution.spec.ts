import { expect, test } from '@playwright/test';
import type { ResolveSaleBody, SaleStatusHistory } from '../../src/services/http';
import {
  ADMINISTRATIVE_PERMISSIONS,
  SELLER_PERMISSIONS,
  SUPERVISOR_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  buildSale,
  mockApi,
  sessionResponse,
} from './support/api-mock';

const ID = 'a1b2c3d4-3333-4000-8000-000000000003';
const reason = 'La prepaga rechazó la solicitud por documentación no válida.';

for (const status of ['APPROVED', 'REJECTED'] as const) {
  test(`administrative records ${status} and seller sees the final outcome`, async ({
    page,
  }, testInfo) => {
    if (status === 'REJECTED') await page.setViewportSize({ width: 390, height: 844 });
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    let sale = buildSale({ status: 'IN_REVIEW', version: 4 });
    const history: SaleStatusHistory = { items: [] };
    let requests = 0;
    await page.route(`**/api/v1/sales/${ID}`, (route) => route.fulfill({ json: sale }));
    await page.route(`**/api/v1/sales/${ID}/history`, (route) => route.fulfill({ json: history }));
    await page.route(`**/api/v1/sales/${ID}/resolve`, async (route) => {
      requests += 1;
      const body = route.request().postDataJSON() as ResolveSaleBody;
      expect(body.status).toBe(status);
      expect(body.version).toBe(4);
      expect(route.request().headers()['x-csrf-token']).toBeTruthy();
      if (status === 'REJECTED') expect(body.reason).toBe(reason);
      history.items.push({
        id: 'resolution-1',
        fromStatus: 'IN_REVIEW',
        toStatus: status,
        reason: body.reason ?? null,
        createdAt: '2026-10-26T12:00:00Z',
        changedBy: { ...sale.seller, firstName: 'Ada', lastName: 'Administrativa' },
      });
      sale = { ...sale, status, version: 5 };
      await route.fulfill({ json: sale });
    });
    await page.goto(`/administrative/sales/${ID}`);
    await page
      .getByRole('button', { name: status === 'APPROVED' ? 'Aprobar' : 'Rechazar', exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    const confirm = dialog.getByRole('button', {
      name: status === 'APPROVED' ? 'Confirmar aprobación' : 'Confirmar rechazo',
    });
    if (status === 'REJECTED') {
      await confirm.click();
      await expect(
        dialog.getByText('Indicá un motivo de entre 3 y 2000 caracteres.'),
      ).toBeVisible();
      expect(requests).toBe(0);
      await dialog.getByLabel('Motivo del rechazo *').fill(`  ${reason}  `);
    }
    await confirm.click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByTestId('sale-resolution')).toContainText(
      status === 'APPROVED' ? 'Venta aprobada' : 'Venta rechazada',
    );
    await expect(
      page.getByRole('button', {
        name: /^(Aprobar|Rechazar|Iniciar revisión|Solicitar corrección)$/,
      }),
    ).toHaveCount(0);
    expect(requests).toBe(1);

    const session = sessionResponse(SELLER_PERMISSIONS);
    session.user.role.code = 'SELLER';
    await page.route('**/api/v1/auth/me', (route) => route.fulfill({ json: session }));
    await page.goto(`/sales/${ID}`);
    await page.reload();
    const notice = page.getByTestId('sale-resolution');
    await expect(notice).toContainText('La gestión de esta venta finalizó.');
    await expect(notice).toContainText('Ada Administrativa');
    if (status === 'REJECTED') await expect(notice).toContainText(reason);
    await expect(page.getByRole('link', { name: 'Editar', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Presentar', exact: true })).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('sale-resolution.png'), fullPage: true });
  });
}

test('stale decision remains unconfirmed and offers refresh', async ({ page }) => {
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  await page.route(`**/api/v1/sales/${ID}`, (route) =>
    route.fulfill({ json: buildSale({ status: 'SUBMITTED' }) }),
  );
  await page.route(`**/api/v1/sales/${ID}/resolve`, (route) =>
    route.fulfill({
      status: 409,
      json: {
        type: 'about:blank',
        title: 'La venta cambió. Actualizá la información.',
        status: 409,
        code: 'VERSION_CONFLICT',
      },
    }),
  );
  await page.goto(`/administrative/sales/${ID}`);
  await page.getByRole('button', { name: 'Aprobar', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Confirmar aprobación' }).click();
  await expect(dialog.getByRole('button', { name: 'Revisar versión actual' })).toBeVisible();
  await expect(page.getByTestId('sale-resolution')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Revisar versión actual' }).click();
  await expect(dialog).not.toBeVisible();
});

for (const permissions of [SELLER_PERMISSIONS, SUPERVISOR_PERMISSIONS, SUPER_ADMIN_PERMISSIONS]) {
  test(`closed sale status and rejection reason visible with ${permissions.includes('home.admin.read') ? 'admin' : permissions.includes('home.supervisor.read') ? 'supervisor' : 'seller'} permissions`, async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, permissions });
    const sale = buildSale({ status: 'REJECTED' });
    await page.route(`**/api/v1/sales/${ID}`, (route) => route.fulfill({ json: sale }));
    await page.route(`**/api/v1/sales/${ID}/history`, (route) =>
      route.fulfill({
        json: {
          items: [
            {
              id: 'resolution-1',
              fromStatus: 'SUBMITTED',
              toStatus: 'REJECTED',
              reason,
              changedBy: sale.seller,
              createdAt: sale.updatedAt,
            },
          ],
        } satisfies SaleStatusHistory,
      }),
    );
    await page.goto(`/sales/${ID}`);
    await expect(page.getByTestId('sale-resolution')).toContainText(reason);
    await expect(page.getByRole('button', { name: 'Presentar', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Editar', exact: true })).toHaveCount(0);
  });
}
