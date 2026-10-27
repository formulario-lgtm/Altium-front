import { expect, test } from '@playwright/test';
import { mockApi } from './support/api-mock';

for (const width of [390, 1440]) {
  test(`password change centers the group horizontally at the top below the header (${width}px)`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockApi(page, { authenticated: true });
    await page.goto('/account/change-password');
    await expect(page.getByTestId('global-loading')).toHaveCount(0);
    const group = page.getByRole('region', { name: 'Cambiar contraseña', exact: true });
    await expect(group).toBeVisible();
    const box = (await group.boundingBox())!;
    const header = (await page.getByRole('banner').boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThanOrEqual(2);
    const topSpacing = width >= 960 ? 32 : 24;
    expect(Math.abs(box.y - (header.y + header.height + topSpacing))).toBeLessThanOrEqual(2);
    const save = (await page
      .getByRole('button', { name: 'Guardar contraseña', exact: true })
      .boundingBox())!;
    expect(Math.abs(save.x + save.width / 2 - width / 2)).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: testInfo.outputPath('password-change.png'),
      animations: 'disabled',
    });
  });
}

test('short screens can scroll through all password fields and validation messages', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await mockApi(page, { authenticated: true });
  await page.goto('/account/change-password');
  await page.getByRole('button', { name: 'Guardar contraseña', exact: true }).click();
  await expect(page.getByLabel('Contraseña actual', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Guardar contraseña', exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole('button', { name: 'Guardar contraseña', exact: true }),
  ).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
