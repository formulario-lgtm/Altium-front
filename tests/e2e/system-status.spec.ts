import { expect, test } from '@playwright/test';
import { mockApi } from './support/api-mock';

test('theme toggle switches between light and dark on the login screen', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');

  // Dark is the default on first visit when no preference is stored.
  await expect(page.getByRole('button', { name: /Cambiar a tema claro/i })).toBeVisible();
  await page.getByRole('button', { name: /Cambiar a tema claro/i }).click();
  await expect(page.getByRole('button', { name: /Cambiar a tema oscuro/i })).toBeVisible();

  const stored = await page.evaluate(() => window.localStorage.getItem('altium.ui.theme'));
  expect(stored).toBe('light');
});

test('system status page loads inside the authenticated shell', async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto('/system');

  await expect(page.getByRole('heading', { name: 'Estado del sistema' })).toBeVisible();
});
