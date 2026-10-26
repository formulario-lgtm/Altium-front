import { expect, test } from '@playwright/test';
import { CSRF_TOKEN, mockApi, VALID_PASSWORD } from './support/api-mock';

test.describe('authentication', () => {
  test('expires a session with pending requests and logs in again in the same tab', async ({
    page,
  }) => {
    const api = await mockApi(page, { authenticated: true });
    let releaseUsers!: () => void;
    let releaseRoles!: () => void;
    const usersGate = new Promise<void>((resolve) => {
      releaseUsers = resolve;
    });
    const rolesGate = new Promise<void>((resolve) => {
      releaseRoles = resolve;
    });
    let firstUsers = true;
    let firstRoles = true;
    await page.route('**/api/v1/users?*', async (route) => {
      if (!firstUsers) return route.fallback();
      firstUsers = false;
      await usersGate;
      await route.fulfill({
        status: 401,
        json: { status: 401, code: 'AUTH_SESSION_EXPIRED', title: 'Session expired' },
      });
    });
    await page.route('**/api/v1/roles**', async (route) => {
      if (!firstRoles) return route.fallback();
      firstRoles = false;
      await rolesGate;
      await route.fulfill({
        status: 401,
        json: { status: 401, code: 'AUTH_SESSION_EXPIRED', title: 'Session expired' },
      });
    });
    try {
      await page.goto('/users');
      await expect(page.getByTestId('global-loading')).toBeVisible();
      api.authenticated = false;
      releaseRoles();
      await expect(page).toHaveURL(/\/login\?redirect=.*users.*reason=expired/);
      await expect(page.getByTestId('global-loading')).not.toBeVisible();
      await page.getByLabel('Correo electrónico').fill('ana.perez@altium.example');
      await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
      await page.getByRole('button', { name: 'Iniciar sesión' }).click();
      await expect(page).toHaveURL(/\/users$/);
      await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();
      releaseUsers();
      await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
      await expect(page).toHaveURL(/\/users$/);
    } finally {
      releaseUsers();
      releaseRoles();
    }
  });

  test('can retry login in the same redirect URL after the API reconnects', async ({ page }) => {
    await mockApi(page);
    let offline = true;
    await page.route('**/api/v1/auth/login', (route) =>
      offline ? route.abort('failed') : route.fallback(),
    );
    await page.goto('/login?redirect=%2Fusers&reason=expired');
    await page.getByLabel('Correo electrónico').fill('ana.perez@altium.example');
    await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByTestId('login-form').getByRole('alert')).toContainText(
      'No se pudo conectar con la API',
    );
    offline = false;
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/users$/);
  });
  test('redirects protected routes to login with redirect', async ({ page }) => {
    await mockApi(page);
    await page.goto('/users');

    await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)users$/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('shows an error on invalid credentials', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');

    await page.getByLabel('Correo electrónico').fill('ana.perez@altium.example');
    await page.getByLabel('Contraseña', { exact: true }).fill('wrong-password');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos.');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logs in, lands on redirect target and logs out with CSRF header', async ({ page }) => {
    const api = await mockApi(page);
    await page.goto('/users');

    await page.getByLabel('Correo electrónico').fill('ana.perez@altium.example');
    await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/users$/);
    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible();

    const stored = await page.evaluate(() => JSON.stringify(window.localStorage));
    expect(stored).not.toContain(VALID_PASSWORD);
    expect(stored).not.toContain(CSRF_TOKEN);

    await page.getByTestId('user-menu').click();
    await page.getByTestId('logout').click();

    await expect(page).toHaveURL(/\/login$/);
    expect(api.csrfHeaders.at(-1)).toBe(CSRF_TOKEN);

    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('expired session landing stays usable after /me 401', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login?redirect=/users&reason=expired');

    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    await expect(page.getByText('Tu sesión terminó')).toBeVisible();

    const email = page.getByLabel('Correo electrónico');
    await expect(email).toBeEnabled();
    await email.fill('ana.perez@altium.example');
    await page.getByLabel('Contraseña', { exact: true }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/users$/);
  });

  test('home shows quick links filtered by permissions', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ['teams.read'] });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Navegación principal' });
    await expect(nav.getByText('Equipos')).toBeVisible();
    await expect(nav.getByText('Usuarios')).toHaveCount(0);

    await page.goto('/audit');
    await expect(page.getByRole('heading', { name: 'Acceso denegado' })).toBeVisible();
  });
});
