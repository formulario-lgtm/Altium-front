import { expect, test } from '@playwright/test';
import {
  ADMINISTRATIVE_PERMISSIONS,
  SELLER_PERMISSIONS,
  buildSale,
  mockApi,
} from './support/api-mock';

for (const mobile of [false, true]) {
  for (const light of [false, true]) {
    test(`calendar field ${mobile ? 'mobile' : 'desktop'} ${light ? 'light' : 'dark'}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      );
      await page.clock.setFixedTime(new Date('2026-10-26T12:00:00Z'));
      await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
      await page.goto('/sales');
      if (light) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
      const input = page.getByLabel('Creada hasta', { exact: true });
      const field = page.locator('.altium-date-field').filter({ has: input });
      const box = await field.boundingBox();
      await field.click({ position: { x: box!.width - 5, y: 25 } });
      const calendar = page.getByRole('dialog', { name: 'Calendario: Creada hasta', exact: true });
      await expect(calendar).toBeVisible();
      await expect(calendar.getByRole('button', { name: /15.*octubre.*2026/i })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath('calendar.png'),
        fullPage: true,
        animations: 'disabled',
      });
      await calendar.getByRole('button', { name: /15.*octubre.*2026/i }).click();
      await expect(calendar).not.toBeVisible();
      await expect(input).toHaveValue('15/10/2026');
      await input.focus();
      await input.press('Enter');
      await expect(calendar).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(calendar).not.toBeVisible();
      await page
        .getByRole('button', { name: 'Abrir calendario: Creada hasta', exact: true })
        .click();
      await calendar.getByRole('button', { name: 'Borrar', exact: true }).click();
      await expect(input).toHaveValue('');
    });
  }
}

test('date and time apply together and cancellation preserves the previous value', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-26T12:00:00Z'));
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  const sale = buildSale({ status: 'IN_REVIEW' });
  await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
  await page.goto(`/administrative/sales/${sale.id}?section=followUps`);
  const input = page.getByLabel('Próximo seguimiento (opcional)', { exact: true });
  await input.click();
  const calendar = page.getByRole('dialog', {
    name: 'Calendario: Próximo seguimiento (opcional)',
    exact: true,
  });
  await expect(calendar).toBeVisible();
  await calendar.getByRole('button', { name: /15.*octubre.*2026/i }).click();
  await calendar.getByLabel('Hora', { exact: true }).fill('09:30');
  await calendar.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(input).toHaveValue('15/10/2026 09:30');
  await input.click();
  await calendar.getByRole('button', { name: /16.*octubre.*2026/i }).click();
  await calendar.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(input).toHaveValue('15/10/2026 09:30');
});
