import { expect, test } from '@playwright/test';
import type { SaleDocuments, SaleStatusHistory } from '../../src/services/http';
import { buildSale, mockApi, SELLER_PERMISSIONS } from './support/api-mock';

const ID = 'a1b2c3d4-3333-4000-8000-000000000003';
const filename =
  'documentacion-titular-nombre-de-archivo-muy-largo-sin-espacios-para-verificar-visualizacion.pdf';

test.describe('Sale detail UX', () => {
  for (const mobile of [false, true]) {
    for (const light of [false, true]) {
      test(`submitted sale, ${mobile ? 'mobile' : 'desktop'}, ${light ? 'light' : 'dark'}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize(
          mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        );
        await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
        const sale = buildSale({ status: 'SUBMITTED', submittedAt: '2026-10-24T12:00:00Z' });
        await page.route(`**/api/v1/sales/${ID}`, (route) => route.fulfill({ json: sale }));
        const documents: SaleDocuments = {
          storageIntegrationPending: false,
          requiredCategories: [
            {
              documentType: 'DNI_FRONT',
              label: 'DNI frente · Titular · Ana Pérez',
              saleMemberId: sale.members[0]!.id,
              satisfied: true,
            },
          ],
          items: [
            {
              id: 'doc-1',
              documentType: 'DNI_FRONT',
              fileSize: 1024,
              mimeType: 'application/pdf',
              originalFilename: filename,
              saleMemberId: sale.members[0]!.id,
              status: 'UPLOADED',
              createdAt: sale.createdAt,
            },
          ],
        };
        await page.route(`**/api/v1/sales/${ID}/documents`, (route) =>
          route.fulfill({ json: documents }),
        );
        const history: SaleStatusHistory = {
          items: [
            {
              id: 'old',
              fromStatus: null,
              toStatus: 'DRAFT',
              reason: 'Sale draft created',
              createdAt: sale.createdAt,
              changedBy: sale.seller,
            },
            {
              id: 'new',
              fromStatus: 'DRAFT',
              toStatus: 'SUBMITTED',
              reason: 'Presentación reciente',
              createdAt: sale.submittedAt!,
              changedBy: sale.seller,
            },
          ],
        };
        await page.route(`**/api/v1/sales/${ID}/history`, (route) =>
          route.fulfill({ json: history }),
        );
        await page.goto(`/sales/${ID}`);
        if (light) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
        await expect(page.getByTestId('sale-detail-summary')).toContainText('Plan A1');
        await expect(page.getByTestId('sale-detail-contact').locator('dt')).toHaveText([
          'Teléfono',
          'Correo electrónico',
          'Domicilio',
          'Provincia',
          'Código postal',
        ]);
        await expect(page.getByTestId('sale-detail-billing')).toContainText('Visa •••• 4242');
        await expect(page.getByTestId('sale-detail-documents')).toContainText('1 de 1');
        await expect(page.getByRole('button', { name: `Descargar ${filename}` })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Presentar', exact: true })).toHaveCount(0);
        const historyList = page
          .getByRole('heading', { name: 'Historial', exact: true })
          .locator('..');
        await expect(historyList.locator('.v-list-item').first()).toContainText(
          'Presentación reciente',
        );
        await page.getByText('Datos personales y de salud', { exact: true }).click();
        await expect(page.getByText('Fecha de nacimiento', { exact: true })).toBeVisible();
        await expect(page.getByText('10/05/1990', { exact: true })).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('sale-detail.png'), fullPage: true });
      });
    }
  }

  test('draft explains missing data and offers editing', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.route(`**/api/v1/sales/${ID}`, (route) =>
      route.fulfill({ json: buildSale({ contact: null, healthPlan: null }) }),
    );
    await page.goto(`/sales/${ID}`);
    await expect(page.getByTestId('sale-detail-contact')).toContainText('Sin completar');
    await expect(page.getByRole('button', { name: 'Presentar', exact: true })).toBeDisabled();
    await expect(page.getByText('Esta venta todavía está en preparación')).toBeVisible();
    await expect(page.getByText('Sin archivos adjuntos', { exact: true })).toBeVisible();
    await page.getByRole('link', { name: 'Editar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/sales/${ID}/edit$`));
  });

  test('documentation errors can be retried instead of displaying an empty checklist', async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    let failed = true;
    await page.route(`**/api/v1/sales/${ID}/documents`, (route) =>
      failed
        ? route.fulfill({
            status: 503,
            json: { title: 'Documentación no disponible', status: 503, type: 'about:blank' },
          })
        : route.fulfill({
            json: {
              items: [],
              requiredCategories: [],
              storageIntegrationPending: false,
            } satisfies SaleDocuments,
          }),
    );
    await page.goto(`/sales/${ID}`);
    const panel = page.getByTestId('sale-detail-documents');
    await expect(panel.getByRole('button', { name: /Reintentar/ })).toBeVisible();
    failed = false;
    await panel.getByRole('button', { name: /Reintentar/ }).click();
    await expect(panel.getByText('Sin archivos adjuntos', { exact: true })).toBeVisible();
  });
});
