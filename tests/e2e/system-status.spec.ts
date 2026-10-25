import { expect, test } from '@playwright/test';
import { mockApi } from './support/api-mock';

test('theme toggle switches between light and dark on the login screen', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');

  await expect(page.getByRole('button', { name: /Cambiar a tema oscuro/i })).toBeVisible();
  await page.getByRole('button', { name: /Cambiar a tema oscuro/i }).click();
  await expect(page.getByRole('button', { name: /Cambiar a tema claro/i })).toBeVisible();

  const stored = await page.evaluate(() => window.localStorage.getItem('altium.ui.theme'));
  expect(stored).toBe('dark');
});

test('system status page loads inside the authenticated shell', async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto('/system');

  await expect(page.getByRole('heading', { name: 'Estado del sistema' })).toBeVisible();
});
