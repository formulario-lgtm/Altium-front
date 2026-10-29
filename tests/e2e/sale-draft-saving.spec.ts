import { expect, test, type Page } from '@playwright/test';
import type { SaleDocuments, UpdateSaleBody } from '../../src/services/http';
import { buildSale, mockApi, SELLER_PERMISSIONS } from './support/api-mock';

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}
async function setup(page: Page) {
  await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
  let sale = buildSale({ customerType: 'VOLUNTARY', employment: null });
  sale.members[0]!.cuil = '20123456786';
  sale.members[0]!.lastMenstrualPeriod = '2026-10-01';
  const state = {
    gets: 0,
    documentGets: 0,
    bodies: [] as UpdateSaleBody[],
    saveGate: undefined as ReturnType<typeof gate> | undefined,
    documentGate: undefined as ReturnType<typeof gate> | undefined,
    failSave: false,
    expireSession: false,
    validationFailure: false,
  };
  await page.route(`**/api/v1/sales/${sale.id}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON() as UpdateSaleBody;
      state.bodies.push(body);
      const pending = state.saveGate;
      state.saveGate = undefined;
      if (pending) await pending.promise;
      if (state.expireSession)
        return route.fulfill({
          status: 401,
          json: {
            type: 'about:blank',
            title: 'Expired',
            status: 401,
            code: 'AUTH_SESSION_EXPIRED',
          },
        });
      if (state.validationFailure)
        return route.fulfill({
          status: 400,
          json: {
            type: 'about:blank',
            title: 'Validation failed',
            status: 400,
            code: 'VALIDATION_ERROR',
            errors: [
              {
                field: 'contact.email',
                code: 'INVALID_EMAIL',
                message: 'El correo no es aceptado.',
              },
            ],
          },
        });
      if (state.failSave)
        return route.fulfill({
          status: 409,
          json: { type: 'about:blank', title: 'Conflict', status: 409, code: 'VERSION_CONFLICT' },
        });
      expect(body.version).toBe(sale.version);
      sale = {
        ...sale,
        version: sale.version + 1,
        observations: body.observations ?? null,
        contact: body.contact ? { ...sale.contact!, ...body.contact } : sale.contact,
        billing: body.billing ? { ...sale.billing!, ...body.billing } : sale.billing,
        members: (body.members ?? []).map((member, index) => ({
          ...sale.members[index]!,
          ...member,
          id: member.id ?? `member-${index}`,
        })),
      };
    } else state.gets++;
    await route.fulfill({ json: sale });
  });
  await page.route(`**/api/v1/sales/${sale.id}/documents`, async (route) => {
    state.documentGets++;
    const pending = state.documentGate;
    state.documentGate = undefined;
    if (pending) await pending.promise;
    const documents: SaleDocuments = {
      storageIntegrationPending: false,
      items: [],
      requiredCategories: [
        {
          documentType: 'DNI_FRONT',
          label: `DNI frente · ${sale.members[0]!.firstName}`,
          saleMemberId: sale.members[0]!.id,
          satisfied: true,
        },
      ],
    };
    await route.fulfill({ json: documents });
  });
  await page.goto(`/sales/${sale.id}/edit`);
  await expect(page.getByTestId('sale-completion')).toBeVisible();
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
  return { state, id: sale.id };
}
async function section(page: Page, label: string) {
  const nav = page.getByRole('navigation', { name: 'Secciones de la venta' });
  if (await nav.isVisible()) await nav.getByText(label, { exact: true }).click();
  else {
    await page.getByLabel('Sección', { exact: true }).locator('..').click();
    await page.getByRole('option', { name: label, exact: true }).click();
  }
}
const saveButton = (page: Page) =>
  page.getByRole('button', { name: 'Guardar borrador', exact: true });

test('typing never saves; explicit background saves preserve focus and newer edits without detail refetches', async ({
  page,
}) => {
  const { state } = await setup(page);
  await section(page, 'Contacto y domicilio');
  const email = page.getByLabel('Email *', { exact: true });
  await email.fill('primero@example.com');
  // Wait longer than the removed 800 ms debounce to catch any accidental autosave.
  await page.waitForTimeout(1400);
  expect(state.bodies).toHaveLength(0);
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
  const field = await email.elementHandle();
  const pending = gate();
  state.saveGate = pending;
  try {
    await saveButton(page).click();
    await expect.poll(() => state.bodies.length).toBe(1);
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    await expect(saveButton(page)).toBeDisabled();
    await email.fill('ultimo@example.com');
    pending.release();
    await expect(page.getByText('Cambios sin guardar', { exact: true })).toBeVisible();
    await expect(email).toHaveValue('ultimo@example.com');
    await expect(email).toBeFocused();
    expect(await field!.evaluate((element) => element.isConnected)).toBe(true);
    expect(state.bodies[0]!.contact?.email).toBe('primero@example.com');
    await saveButton(page).click();
    await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
    expect(state.bodies).toHaveLength(2);
    expect(state.bodies[1]!.version).toBe(2);
    expect(state.bodies[1]!.contact?.email).toBe('ultimo@example.com');
    await section(page, 'Observaciones');
    await section(page, 'Contacto y domicilio');
    await section(page, 'Cobranza y facturación');
    expect(state.bodies).toHaveLength(2);
    expect(state.gets).toBe(1);
    expect(state.documentGets).toBe(1);
  } finally {
    pending.release();
  }
});

test('section changes await validation and save without a global blocker', async ({ page }) => {
  const { state } = await setup(page);
  await section(page, 'Contacto y domicilio');
  await page.getByLabel('Email *', { exact: true }).fill('contacto@example.com');
  const pending = gate();
  state.saveGate = pending;
  try {
    await section(page, 'Cobranza y facturación');
    await expect.poll(() => state.bodies.length).toBe(1);
    await expect(page.getByLabel('Email *', { exact: true })).toBeVisible();
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    pending.release();
    await expect(
      page.getByRole('heading', { name: 'Cobranza y facturación', exact: true }),
    ).toBeVisible();
    await page.getByLabel('Marca de tarjeta *', { exact: true }).fill('Mastercard');
    await section(page, 'Observaciones');
    await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
    expect(state.bodies).toHaveLength(2);
    expect(state.bodies[1]!.version).toBe(2);
    expect(state.bodies[1]!.billing?.cardBrand).toBe('Mastercard');
    expect(state.gets).toBe(1);
  } finally {
    pending.release();
  }
});

test('leaving unsaved changes asks before discarding and cancellation preserves the form', async ({
  page,
}) => {
  const { state, id } = await setup(page);
  await section(page, 'Observaciones');
  await page.getByLabel('Observaciones', { exact: true }).fill('Pendiente de guardar');
  await page.getByRole('link', { name: 'Volver', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Hay cambios sin guardar');
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(page).toHaveURL(new RegExp(`/sales/${id}/edit$`));
  await expect(page.getByLabel('Observaciones', { exact: true })).toHaveValue(
    'Pendiente de guardar',
  );
  expect(state.bodies).toHaveLength(0);
  await page.getByRole('link', { name: 'Volver', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Salir sin guardar' }).click();
  await expect(page).toHaveURL(/\/sales$/);
  expect(state.bodies).toHaveLength(0);
});

test('document requirements refresh without delaying the save or allowing stale uploads', async ({
  page,
}) => {
  const { state } = await setup(page);
  await section(page, 'Integrantes');
  await page.getByLabel('Nombre *', { exact: true }).fill('Nombre actualizado');
  const pending = gate();
  state.documentGate = pending;
  try {
    await section(page, 'Documentación');
    await expect.poll(() => state.documentGets).toBe(2);
    await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    const upload = page
      .getByTestId('sale-document-DNI_FRONT:' + buildSale().members[0]!.id)
      .getByRole('button', { name: 'Subir archivo' });
    await expect(upload).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Presentar venta', exact: true })).toBeDisabled();
    pending.release();
    await expect(
      page.getByText('DNI frente · Nombre actualizado *', { exact: true }),
    ).toBeVisible();
    await expect(upload).toBeEnabled();
    expect(state.gets).toBe(1);
  } finally {
    pending.release();
  }
});

test('conflicts retain unsaved values and block further saves until recovery', async ({ page }) => {
  const { state } = await setup(page);
  await section(page, 'Contacto y domicilio');
  await page.getByLabel('Email *', { exact: true }).fill('no-perder@example.com');
  state.failSave = true;
  await saveButton(page).click();
  await expect(page.getByText('Conflicto de versión', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Email *', { exact: true })).toHaveValue('no-perder@example.com');
  await saveButton(page).click();
  expect(state.bodies).toHaveLength(1);
  state.failSave = false;
  await page.getByRole('button', { name: 'Recuperar versión actual' }).click();
  await expect(page.getByText('Conflicto de versión', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Email *', { exact: true })).toHaveValue(
    buildSale().contact!.email!,
  );
});

test('session expiry during a non-blocking draft save can redirect to login', async ({ page }) => {
  const { state } = await setup(page);
  await section(page, 'Observaciones');
  await page.getByLabel('Observaciones', { exact: true }).fill('Borrador');
  state.expireSession = true;
  await saveButton(page).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Iniciar sesión', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
});

test('first saving a new child keeps its input connected and preserves edits made during the request', async ({
  page,
}) => {
  const { state } = await setup(page);
  await section(page, 'Integrantes');
  await page.getByRole('button', { name: '+ Hijo/a', exact: true }).click();
  const name = page.getByLabel('Nombre *', { exact: true }).nth(1);
  await name.fill('Nombre inicial');
  const field = await name.elementHandle();
  const pending = gate();
  state.saveGate = pending;
  try {
    await saveButton(page).click();
    await expect.poll(() => state.bodies.length).toBe(1);
    await name.fill('Nombre actualizado');
    pending.release();
    await expect(page.getByText('Cambios sin guardar', { exact: true })).toBeVisible();
    await expect(name).toHaveValue('Nombre actualizado');
    await expect(name).toBeFocused();
    expect(await field!.evaluate((element) => element.isConnected)).toBe(true);
    await saveButton(page).click();
    await expect(page.getByText('Guardado', { exact: true })).toBeVisible();
    expect(state.bodies[1]!.members![1]!.id).toBe('member-1');
    expect(state.bodies[1]!.members![1]!.firstName).toBe('Nombre actualizado');
  } finally {
    pending.release();
  }
});

for (const mobile of [false, true]) {
  test(`invalid CUIL blocks continue, navigation and saving without blur validation (${mobile ? 'mobile' : 'desktop'})`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    const { state } = await setup(page);
    await section(page, 'Integrantes');
    const cuil = page.getByLabel('CUIL *', { exact: true }).first();
    await cuil.fill('20346737751');
    await page.getByLabel('Nombre *', { exact: true }).first().click();
    await expect(
      page.getByText(
        'Ingresá un CUIL/CUIT válido de 11 dígitos, con dígito verificador correcto.',
        { exact: true },
      ),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(
      page
        .getByText('Ingresá un CUIL/CUIT válido de 11 dígitos, con dígito verificador correcto.', {
          exact: true,
        })
        .last(),
    ).toBeVisible();
    await expect(cuil).toBeFocused();
    await section(page, 'Contacto y domicilio');
    await expect(cuil).toBeVisible();
    await saveButton(page).click();
    await expect(cuil).toBeFocused();
    expect(state.bodies).toHaveLength(0);
    await cuil.fill('27301234568');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(page.getByLabel('Email *', { exact: true })).toBeVisible();
    expect(state.bodies).toHaveLength(1);
  });
}

test('invalid email blocks saving and a server validation error keeps the relevant section visible', async ({
  page,
}) => {
  const { state } = await setup(page);
  await section(page, 'Contacto y domicilio');
  const email = page.getByLabel('Email *', { exact: true });
  await email.fill('incorrecto');
  await saveButton(page).click();
  await expect(
    page.getByText('Ingresá un correo electrónico válido.', { exact: true }).last(),
  ).toBeVisible();
  expect(state.bodies).toHaveLength(0);
  await email.fill('valido@example.com');
  state.validationFailure = true;
  await section(page, 'Observaciones');
  await expect(page.getByText('El correo no es aceptado.', { exact: true }).last()).toBeVisible();
  await expect(email).toBeFocused();
  await expect(page.getByText('El correo no es aceptado.', { exact: true }).first()).toBeVisible();
  state.validationFailure = false;
  await email.fill('otro@example.com');
  await section(page, 'Observaciones');
  await expect(page.getByLabel('Observaciones', { exact: true })).toBeVisible();
});
