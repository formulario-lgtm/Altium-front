import { expect, test } from '@playwright/test';
import { mockApi } from './support/api-mock';

for (const width of [390, 1440]) {
  test(`theme changes fully in both directions on login (${width}px)`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockApi(page);
    await page.goto('/login');
    const app = page.locator('.v-application');
    const stage = page.locator('.auth-stage');
    const headline = page.locator('.auth-stage__headline');
    await expect(app).toHaveCSS('opacity', '1');
    await expect(stage).toHaveCSS('--auth-text', '#f4f7fc');
    await page.getByRole('button', { name: 'Cambiar a tema claro', exact: true }).click();
    await expect(app).toHaveClass(/v-theme--light/);
    await expect(app).toHaveCSS('opacity', '1');
    await expect(stage).toHaveCSS('--auth-text', '#15233a');
    await expect(headline).toHaveCSS('color', 'rgb(21, 35, 58)');
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }),
    ).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath('login-light.png'), animations: 'disabled' });
    await page.reload();
    await expect(app).toHaveClass(/v-theme--light/);
    await expect(app).toHaveCSS('opacity', '1');
    await expect(stage).toHaveCSS('--auth-text', '#15233a');
    await page.getByRole('button', { name: 'Cambiar a tema oscuro', exact: true }).click();
    await expect(app).toHaveClass(/v-theme--dark/);
    await expect(app).toHaveCSS('opacity', '1');
    await expect(stage).toHaveCSS('--auth-text', '#f4f7fc');
    expect(await page.evaluate(() => localStorage.getItem('altium.ui.theme'))).toBe('dark');
    await page.screenshot({ path: testInfo.outputPath('login-dark.png'), animations: 'disabled' });
  });
}

test('system status page loads inside the authenticated shell', async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto('/system');

  await expect(page.getByRole('heading', { name: 'Estado del sistema' })).toBeVisible();
});
