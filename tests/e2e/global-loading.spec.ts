import { expect, test } from '@playwright/test';
import { mockApi, USERS, VALID_PASSWORD } from './support/api-mock';

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

for (const [theme, width] of [
  ['dark', 390],
  ['light', 1440],
] as const) {
  test(`login blocks through backend, cold shell, role import and home data (${theme})`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript((mode) => localStorage.setItem('altium.ui.theme', mode), theme);
    await mockApi(page);
    const login = gate();
    const loginStarted = gate();
    const shell = gate();
    const shellStarted = gate();
    const role = gate();
    const roleStarted = gate();
    const home = gate();
    const homeStarted = gate();
    let loginCount = 0;
    await page.route('**/api/v1/auth/login', async (route) => {
      loginCount += 1;
      loginStarted.release();
      await login.promise;
      await route.fallback();
    });
    await page.route(/\/assets\/AppShellLayout-[^/]+\.js(?:\?.*)?$/, async (route) => {
      shellStarted.release();
      await shell.promise;
      await route.fallback();
    });
    await page.route(/\/assets\/AdminHomeView-[^/]+\.js(?:\?.*)?$/, async (route) => {
      roleStarted.release();
      await role.promise;
      await route.fallback();
    });
    await page.route('**/api/v1/home/admin*', async (route) => {
      homeStarted.release();
      await home.promise;
      await route.fallback();
    });
    try {
      await page.goto('/login');
      await expect(page.getByTestId('global-loading')).toHaveCount(0);
      await page.getByLabel('Usuario', { exact: true }).fill('aperez');
      await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
      const submit = page.getByTestId('login-form').locator('button[type="submit"]');
      const submitBox = await submit.boundingBox();
      const themeBox = await page.getByRole('button', { name: /Cambiar a tema/ }).boundingBox();
      await submit.click();
      await loginStarted.promise;
      const blocker = page.getByTestId('global-loading');
      await expect(blocker).toBeVisible();
      await expect(blocker).toBeFocused();
      await expect(submit).toBeDisabled();
      await blocker.evaluate((element) => {
        element.setAttribute('data-instance', 'login-blocker');
      });
      await expect(page.locator('.altium-route-content')).toHaveAttribute('inert', '');
      // Real pointer/key events must not reach anything behind the overlay.
      await page.mouse.click(
        submitBox!.x + submitBox!.width / 2,
        submitBox!.y + submitBox!.height / 2,
      );
      await page.mouse.click(themeBox!.x + themeBox!.width / 2, themeBox!.y + themeBox!.height / 2);
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Escape');
      expect(loginCount).toBe(1);
      await expect(page.locator('.v-application')).toHaveClass(new RegExp(`v-theme--${theme}`));
      await expect(blocker).toBeFocused();
      login.release();
      await shellStarted.promise;
      await expect(blocker).toHaveAttribute('data-instance', 'login-blocker');
      await expect(submit).toBeDisabled();
      shell.release();
      await roleStarted.promise;
      await expect(blocker).toHaveAttribute('data-instance', 'login-blocker');
      role.release();
      await homeStarted.promise;
      await expect(blocker).toHaveAttribute('data-instance', 'login-blocker');
      await expect(page.locator('.v-application')).toHaveCount(1);
      await page.screenshot({
        path: testInfo.outputPath('global-loading.png'),
        animations: 'disabled',
      });
      home.release();
      await expect(blocker).toHaveCount(0);
      await expect(page.locator('.altium-route-content')).not.toHaveAttribute('inert', '');
      await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
      expect(loginCount).toBe(1);
    } finally {
      login.release();
      shell.release();
      role.release();
      home.release();
    }
  });
}

test('failed login releases the blocker and allows retry', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');
  await page.getByLabel('Usuario', { exact: true }).fill('aperez');
  await page.getByLabel('Contraseña', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('Usuario o contraseña incorrectos.');
  await expect(page.getByRole('button', { name: 'Iniciar sesión', exact: true })).toBeEnabled();
  await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
});

test('failed home import releases the blocker and can recover with reload', async ({ page }) => {
  await mockApi(page);
  let fail = true;
  await page.route(/\/assets\/AdminHomeView-[^/]+\.js(?:\?.*)?$/, async (route) => {
    if (!fail) return route.fallback();
    await route.fulfill({ status: 503, contentType: 'text/javascript', body: '' });
  });
  await page.goto('/login');
  await page.getByLabel('Usuario', { exact: true }).fill('aperez');
  await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo cargar la pantalla de inicio.');
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
  fail = false;
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
});

test('a slow save blocks an open dialog as well as the shell', async ({ page }) => {
  await mockApi(page, { authenticated: true });
  const save = gate();
  const started = gate();
  await page.route('**/api/v1/users/*', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();
    started.release();
    await save.promise;
    await route.fulfill({ status: 200, json: { ...USERS[0], email: 'updated@example.com' } });
  });
  try {
    await page.goto('/users');
    await page.getByRole('button', { name: 'Acciones para Ana Pérez', exact: true }).click();
    await page.getByText('Editar', { exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Correo electrónico').fill('updated@example.com');
    const cancel = await dialog
      .getByRole('button', { name: 'Cancelar', exact: true })
      .boundingBox();
    await dialog.getByRole('button', { name: 'Guardar', exact: true }).click();
    await started.promise;
    const blocker = page.getByTestId('global-loading');
    await expect(blocker).toBeVisible();
    await expect(blocker).toBeFocused();
    await page.mouse.click(cancel!.x + cancel!.width / 2, cancel!.y + cancel!.height / 2);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(blocker).toBeFocused();
    save.release();
    await expect(blocker).toHaveCount(0);
    await expect(dialog).toHaveCount(0);
  } finally {
    save.release();
  }
});
