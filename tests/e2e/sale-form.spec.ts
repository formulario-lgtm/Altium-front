import { expect, test, type Page } from '@playwright/test';
import type { SaleDocuments, UpdateSaleBody } from '../../src/services/http';
import { buildSale, mockApi, SELLER_PERMISSIONS } from './support/api-mock';

const SALE_ID = 'a1b2c3d4-3333-4000-8000-000000000003';
async function setup(page: Page, incomplete = false) {
  await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
  let sale = buildSale({ customerType: 'VOLUNTARY', employment: null });
  sale.members[0]!.cuil = '20123456786';
  sale.members[0]!.lastMenstrualPeriod = '2026-10-01';
  if (incomplete) {
    sale.healthPlan = null;
    sale.customerType = null;
    sale.members[0]!.firstName = null;
    sale.contact!.email = null;
  }
  const state = { failSave: false, failDocs: false, submits: 0, documentsComplete: true };
  await page.route(`**/api/v1/sales/${SALE_ID}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      if (state.failSave)
        return route.fulfill({
          status: 409,
          json: { type: 'about:blank', title: 'Conflict', status: 409, code: 'VERSION_CONFLICT' },
        });
      const body = route.request().postDataJSON() as UpdateSaleBody;
      sale = {
        ...sale,
        version: sale.version + 1,
        customerType: body.customerType ?? null,
        observations: body.observations ?? null,
        members: (body.members ?? sale.members).map((member, index) => ({
          ...(sale.members[index] ?? sale.members[0]!),
          ...member,
          id: member.id ?? `member-${index}`,
        })),
        contact: body.contact ? { ...sale.contact!, ...body.contact } : sale.contact,
        billing: body.billing ? { ...sale.billing!, ...body.billing } : sale.billing,
        healthPlan: body.healthPlanId ? { id: body.healthPlanId, name: 'A1', code: 'A1' } : null,
      };
    }
    await route.fulfill({ json: sale });
  });
  await page.route(`**/api/v1/sales/${SALE_ID}/documents`, (route) => {
    if (state.failDocs)
      return route.fulfill({
        status: 503,
        json: { status: 503, title: 'Unavailable', type: 'about:blank' },
      });
    const body: SaleDocuments = {
      items: [],
      storageIntegrationPending: false,
      requiredCategories: [
        {
          documentType: 'DNI_FRONT',
          label: 'DNI frente',
          saleMemberId: sale.members[0]!.id,
          satisfied: state.documentsComplete,
        },
      ],
    };
    return route.fulfill({ json: body });
  });
  await page.route(`**/api/v1/sales/${SALE_ID}/submit`, (route) => {
    state.submits += 1;
    sale = { ...sale, status: 'SUBMITTED' };
    return route.fulfill({ json: sale });
  });
  return state;
}

async function section(page: Page, label: string) {
  await expect(page.getByTestId('sale-completion')).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Secciones de la venta' });
  if (await nav.isVisible()) await nav.getByText(label, { exact: true }).click();
  else {
    await page.getByLabel('Sección', { exact: true }).locator('..').click();
    await page.getByRole('option', { name: label, exact: true }).click();
  }
}

test.describe('Sale capture UX and presentation readiness', () => {
  for (const mobile of [false, true])
    for (const light of [false, true]) {
      test(`incomplete form, ${mobile ? 'mobile' : 'desktop'}, ${light ? 'light' : 'dark'}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize(
          mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        );
        await setup(page, true);
        await page.goto(`/sales/${SALE_ID}/edit`);
        if (light) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
        await expect(page.getByTestId('sale-completion')).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Presentar venta', exact: true }),
        ).toBeDisabled();
        await section(page, 'Integrantes');
        await page.getByRole('button', { name: /Ver pendientes/ }).click();
        await expect(page.getByLabel('Datos pendientes')).toContainText('Nombre');
        await page.getByLabel('Datos pendientes').getByText('Integrantes', { exact: true }).click();
        await expect(page.getByLabel('Nombre *', { exact: true })).toHaveAttribute('required', '');
        await expect(page.getByLabel('Edad', { exact: true })).not.toHaveAttribute('required');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await page.screenshot({ path: testInfo.outputPath('sale-form.png'), fullPage: true });
      });
    }

  test('enables presentation after the last mandatory field is completed and saved', async ({
    page,
  }) => {
    const state = await setup(page);
    await page.goto(`/sales/${SALE_ID}/edit`);
    await section(page, 'Contacto y domicilio');
    const email = page.getByLabel('Email *', { exact: true });
    await email.fill('');
    await expect(page.getByRole('button', { name: 'Presentar venta' })).toBeDisabled();
    await email.fill('nuevo@altium.example');
    await expect(page.getByRole('button', { name: 'Presentar venta' })).toBeEnabled();
    await page.getByRole('button', { name: 'Presentar venta' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Presentar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/sales/${SALE_ID}$`));
    expect(state.submits).toBe(1);
  });

  test('does not submit when the final persistence fails', async ({ page }) => {
    const state = await setup(page);
    await page.goto(`/sales/${SALE_ID}/edit`);
    await expect(page.getByRole('button', { name: 'Presentar venta' })).toBeEnabled();
    await page.getByRole('button', { name: 'Presentar venta' }).click();
    state.failSave = true;
    await page.getByRole('dialog').getByRole('button', { name: 'Presentar', exact: true }).click();
    await expect(page.getByText('Conflicto de versión', { exact: true })).toBeVisible();
    expect(state.submits).toBe(0);
  });

  test('requires verified documents and allows retrying their verification', async ({ page }) => {
    const state = await setup(page);
    state.failDocs = true;
    await page.goto(`/sales/${SALE_ID}/edit`);
    await expect(page.getByRole('button', { name: 'Presentar venta' })).toBeDisabled();
    await section(page, 'Documentación');
    await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    state.failDocs = false;
    state.documentsComplete = false;
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(page.getByText('DNI frente *', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Presentar venta' })).toBeDisabled();
    state.documentsComplete = true;
    await page.reload();
    await expect(page.getByRole('button', { name: 'Presentar venta' })).toBeEnabled();
  });

  test('detail cannot bypass mandatory data requirements', async ({ page }) => {
    await setup(page, true);
    await page.goto(`/sales/${SALE_ID}`);
    await expect(page.getByRole('button', { name: 'Presentar', exact: true })).toBeDisabled();
    await expect(page.getByRole('link', { name: 'Editar', exact: true })).toBeVisible();
  });
});
