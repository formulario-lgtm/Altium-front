import { expect, test } from '@playwright/test';
import { CSRF_TOKEN, mockApi, VALID_PASSWORD } from './support/api-mock';

test.describe('authentication', () => {
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
