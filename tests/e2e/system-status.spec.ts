import { expect, test } from '@playwright/test';

test('system status page loads with theme toggle', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'System status' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Switch to dark theme/i })).toBeVisible();

  await page.getByRole('button', { name: /Switch to dark theme/i }).click();
  await expect(page.getByRole('button', { name: /Switch to light theme/i })).toBeVisible();
});
