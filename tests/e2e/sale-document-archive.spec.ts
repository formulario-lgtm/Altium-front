import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import type { SaleDocuments } from '../../src/services/http';
import {
  ADMINISTRATIVE_PERMISSIONS,
  buildSale,
  mockApi,
  SELLER_PERMISSIONS,
} from './support/api-mock';

const ZIP = Buffer.from(
  'UEsDBBQAAAAAAKt7W11s1KrzDQAAAA0AAAAQAAAAMDFfZG9jdW1lbnRvLnR4dGRvY3VtZW50byB1bm9QSwMEFAAAAAAAq3tbXSVwVOMNAAAADQAAABAAAAAwMl9kb2N1bWVudG8udHh0ZG9jdW1lbnRvIGRvc1BLAQIUABQAAAAAAKt7W11s1KrzDQAAAA0AAAAQAAAAAAAAAAAAAACAAQAAAAAwMV9kb2N1bWVudG8udHh0UEsBAhQAFAAAAAAAq3tbXSVwVOMNAAAADQAAABAAAAAAAAAAAAAAAIABOwAAADAyX2RvY3VtZW50by50eHRQSwUGAAAAAAIAAgB8AAAAdgAAAAAA',
  'base64',
);
async function setup(page: Page, administrative = false, uploaded = true) {
  await mockApi(page, {
    authenticated: true,
    permissions: administrative ? ADMINISTRATIVE_PERMISSIONS : SELLER_PERMISSIONS,
  });
  const sale = buildSale({ status: 'SUBMITTED' });
  const documents: SaleDocuments = {
    storageIntegrationPending: false,
    requiredCategories: [],
    items: [
      {
        id: 'doc-1',
        documentType: 'DNI_FRONT',
        originalFilename: 'mismo.png',
        saleMemberId: null,
        status: uploaded ? 'UPLOADED' : 'PENDING',
        fileSize: 10,
        mimeType: 'image/png',
        createdAt: sale.createdAt,
      },
      {
        id: 'doc-2',
        documentType: 'OTHER',
        originalFilename: 'mismo.png',
        saleMemberId: null,
        status: uploaded ? 'UPLOADED' : 'PENDING',
        fileSize: 10,
        mimeType: 'image/png',
        createdAt: sale.createdAt,
      },
    ],
  };
  await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
  await page.route(`**/api/v1/sales/${sale.id}/documents`, (route) =>
    route.fulfill({ json: documents }),
  );
  return {
    sale,
    documents,
    url: administrative
      ? `/administrative/sales/${sale.id}?section=documents`
      : `/sales/${sale.id}`,
  };
}
for (const administrative of [false, true]) {
  test(`downloads a single ZIP from ${administrative ? 'administrative review' : 'seller detail'}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(
      administrative ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    );
    const state = await setup(page, administrative);
    let downloads = 0;
    await page.route(`**/api/v1/sales/${state.sale.id}/documents/download`, (route) => {
      downloads++;
      return route.fulfill({
        status: 200,
        contentType: 'application/zip',
        headers: {
          'content-disposition': 'attachment; filename="venta-1-documentos.zip"',
          'access-control-expose-headers': 'Content-Disposition',
        },
        body: ZIP,
      });
    });
    await page.goto(state.url);
    if (administrative) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
    const panel = page.getByTestId('sale-detail-documents');
    const button = panel.getByRole('button', { name: 'Descargar todo', exact: true });
    await expect(button).toBeEnabled();
    await button.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath('documents.png'), fullPage: true });
    const downloading = page.waitForEvent('download');
    await button.click();
    const downloaded = await downloading;
    expect(downloaded.suggestedFilename()).toBe('venta-1-documentos.zip');
    expect(await downloaded.failure()).toBeNull();
    expect(await readFile((await downloaded.path())!)).toEqual(ZIP);
    expect(downloads).toBe(1);
    await expect(
      panel.getByRole('button', { name: 'Descargar mismo.png', exact: true }),
    ).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
test('archive errors are visible and retry succeeds without removing individual downloads', async ({
  page,
}) => {
  const state = await setup(page);
  let fails = true;
  await page.route(`**/api/v1/sales/${state.sale.id}/documents/download`, (route) =>
    fails
      ? route.fulfill({
          status: 503,
          json: {
            type: 'about:blank',
            title: 'Unavailable',
            status: 503,
            detail: 'No se pudo preparar la documentación.',
            code: 'STORAGE_ERROR',
          },
        })
      : route.fulfill({ status: 200, contentType: 'application/zip', body: ZIP }),
  );
  await page.goto(state.url);
  const panel = page.getByTestId('sale-detail-documents');
  await panel.getByRole('button', { name: 'Descargar todo', exact: true }).click();
  await expect(panel.getByRole('alert')).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Descargar todo', exact: true })).toBeEnabled();
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
  fails = false;
  const downloading = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Descargar todo', exact: true }).click();
  expect(await (await downloading).failure()).toBeNull();
  await expect(panel.getByRole('alert')).toHaveCount(0);
});
test('download all is disabled when documents are only pending', async ({ page }) => {
  const state = await setup(page, false, false);
  await page.goto(state.url);
  const panel = page.getByTestId('sale-detail-documents');
  await expect(panel.getByRole('button', { name: 'Descargar todo', exact: true })).toBeDisabled();
});
