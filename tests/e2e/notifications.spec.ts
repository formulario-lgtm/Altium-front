import { expect, test } from '@playwright/test';
import { mockApi, SELLER_PERMISSIONS } from './support/api-mock';
import type { UserNotification, UserNotificationList } from '../../src/services/http';

for (const width of [390, 1440]) {
  test(`notification uses one metadata line and keeps navigation (${width}px)`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    const notification: UserNotification = {
      id: 'a1b2c3d4-1111-4000-8000-000000000009',
      type: 'SALE_APPROVED',
      title: 'Venta aprobada',
      message: '5 - Pedro Pereira',
      entityType: 'sale',
      entityId: 'a1b2c3d4-3333-4000-8000-000000000003',
      actorUserId: null,
      createdAt: '2026-10-26T12:00:00Z',
      readAt: null,
    };
    await page.route('**/api/v1/notifications?*', (route) =>
      route.fulfill({
        json: {
          items: [notification],
          pageInfo: { total: 1, limit: 12, offset: 0, hasNextPage: false },
        } satisfies UserNotificationList,
      }),
    );
    await page.goto('/sales');
    await page.getByRole('button', { name: 'Notificaciones', exact: true }).click();
    const menu = page.locator('.notifications-menu');
    await expect(menu.getByText('5 - Pedro Pereira', { exact: true })).toBeVisible();
    await expect(menu).not.toContainText('V-000005');
    await expect(menu).not.toContainText(notification.entityId!);
    await page.screenshot({
      path: testInfo.outputPath('notifications.png'),
      animations: 'disabled',
    });
    const details = menu.locator('.notifications-menu__details');
    const nameBox = await details.locator('p').boundingBox();
    const dateBox = await details.locator('time').boundingBox();
    expect(Math.abs(nameBox!.y - dateBox!.y)).toBeLessThan(4);
    expect(dateBox!.x).toBeGreaterThan(nameBox!.x);
    const menuBox = await menu.boundingBox();
    expect(menuBox!.x).toBeGreaterThanOrEqual(0);
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(width);
    expect(
      Number(
        await menu
          .getByText('Venta aprobada', { exact: true })
          .evaluate((element) => getComputedStyle(element).fontWeight),
      ),
    ).toBeGreaterThanOrEqual(600);
    await page.screenshot({
      path: testInfo.outputPath('notifications.png'),
      animations: 'disabled',
    });
    await menu.getByText('5 - Pedro Pereira', { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/sales/${notification.entityId}$`));
  });
}
