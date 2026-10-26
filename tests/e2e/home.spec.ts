import { expect, test } from '@playwright/test';
import { sellerHomeFixture } from './support/home-api-mock';
import {
  ADMINISTRATIVE_PERMISSIONS,
  mockApi,
  SELLER_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  SUPERVISOR_PERMISSIONS,
} from './support/api-mock';

test.describe('Home by role', () => {
  for (const mobile of [false, true]) {
    test(`seller populated workspace ${mobile ? 'mobile' : 'desktop'}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(
        mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      );
      await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
      const home = sellerHomeFixture();
      if (!mobile) {
        home.compliance = {
          hasGoal: false,
          targetIsZero: false,
          targetValue: null,
          compliancePercent: null,
        };
        home.remainingToGoal = null;
        home.kpis = home.kpis.map((kpi) =>
          kpi.code === 'COMPLIANCE' ? { ...kpi, value: null, availability: 'NO_GOAL' } : kpi,
        );
      }
      home.recentSales = Array.from({ length: 5 }, (_, index) => ({
        ...home.recentSales[0]!,
        id: `a1b2c3d4-3333-4000-8000-00000000000${index + 1}`,
        saleNumber: `V-00000${5 - index}`,
        status: index === 0 ? 'SUBMITTED' : 'DRAFT',
        holderFirstName: index === 4 ? null : index === 3 ? ' José ' : 'María',
        holderLastName: index >= 3 ? null : 'Gómez',
      }));
      await page.route('**/api/v1/home/seller?*', (route) => route.fulfill({ json: home }));
      await page.goto('/');
      await expect(page.getByTestId('seller-progress')).toBeVisible();
      const holders = page.getByTestId('home-sale-holder');
      await expect(holders).toHaveCount(5);
      await expect(holders.nth(0)).toHaveText('María Gómez');
      await expect(
        page.getByRole('link', { name: /Venta 5.*Ver detalle/ }).locator('.v-list-item-title'),
      ).toHaveText('Venta 5 - María Gómez');
      await expect(holders.nth(3)).toHaveText('José');
      await expect(holders.nth(4)).toHaveText('Titular sin completar');
      if (mobile) {
        const first = await page.getByTestId('home-kpi-card').nth(0).boundingBox();
        const second = await page.getByTestId('home-kpi-card').nth(1).boundingBox();
        expect(first).not.toBeNull();
        expect(second?.y).toBe(first?.y);
      } else {
        const activity = await page.getByTestId('seller-activity').boundingBox();
        const progress = await page.getByTestId('seller-progress').boundingBox();
        expect(activity).not.toBeNull();
        expect(progress?.y).toBe(activity?.y);
        expect(Math.abs((progress?.height ?? 0) - (activity?.height ?? 0))).toBeLessThanOrEqual(1);
        const chart = await page.getByTestId('seller-daily-chart').boundingBox();
        expect(chart?.height).toBeGreaterThan(180);
        expect(
          Math.abs(chart!.y + chart!.height - (progress!.y + progress!.height - 16)),
        ).toBeLessThanOrEqual(1);
        await expect
          .poll(async () => {
            const canvas = await page
              .getByTestId('seller-daily-chart')
              .locator('canvas')
              .boundingBox();
            return Math.abs((canvas?.height ?? 0) - chart!.height);
          })
          .toBeLessThanOrEqual(1);
      }
      await expect(page.getByRole('link', { name: /Venta 5.*Ver detalle/ })).toHaveAttribute(
        'href',
        /\/sales\/[^/]+$/,
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath('seller-home.png'), fullPage: true });
    });
  }

  test('seller home shows KPIs and attention block', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('seller-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Requiere tu atención' })).toBeVisible();
    await expect(page.getByTestId('home-quick-actions')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva venta' })).toBeVisible();
    await expect(page.getByText('Mis sesiones')).toHaveCount(0);
    await expect(page.getByText('Estado del sistema')).toHaveCount(0);
    await expect(
      page.getByTestId('seller-work-queue').getByRole('link', { name: /Corregir/ }),
    ).toHaveAttribute('href', /\/sales\/.+\/edit$/);
    await expect(page.getByRole('link', { name: 'Continuar 2 borradores' })).toHaveAttribute(
      'href',
      '/sales?status=DRAFT',
    );
    await expect(
      page.getByRole('progressbar', { name: 'Cumplimiento del objetivo mensual' }),
    ).toHaveAttribute('aria-valuenow', '40');
    await expect(page.getByText('Te faltan 6 ventas para alcanzar tu objetivo.')).toBeVisible();
    await expect(
      page.getByTestId('seller-home').getByText('Ventas por corregir', { exact: true }),
    ).toHaveCount(0);
    await page.getByRole('link', { name: 'Continuar 2 borradores' }).click();
    await expect(page).toHaveURL(/\/sales\?status=DRAFT$/);
  });

  for (const mobile of [false, true]) {
    for (const light of [false, true]) {
      test(`seller empty workspace, ${mobile ? 'mobile' : 'desktop'}, ${light ? 'light' : 'dark'}`, async ({
        page,
      }, testInfo) => {
        await page.setViewportSize(
          mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        );
        await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
        const home = sellerHomeFixture();
        home.returnedNeedingCorrection = [];
        home.recentSales = [];
        home.alerts = [
          {
            code: 'NO_GOAL',
            title: 'Sin objetivo',
            description: 'Sin objetivo configurado',
            severity: 'info',
          },
        ];
        home.compliance = {
          hasGoal: false,
          targetIsZero: false,
          targetValue: null,
          compliancePercent: null,
        };
        home.dailyPresented = [];
        home.remainingToGoal = null;
        home.presentedToday = 0;
        home.kpis = home.kpis.map((kpi) => ({
          ...kpi,
          value: kpi.code === 'COMPLIANCE' ? null : 0,
          delta: null,
          previousValue: null,
          availability: kpi.code === 'COMPLIANCE' ? 'NO_GOAL' : 'ZERO',
        }));
        await page.route('**/api/v1/home/seller?*', (route) => route.fulfill({ json: home }));
        await page.goto('/');
        if (light) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
        await expect(
          page.getByRole('heading', { name: 'Todo al día con tus correcciones' }),
        ).toBeVisible();
        await expect(page.getByText('Tu primera venta empieza acá')).toBeVisible();
        await expect(
          page.getByTestId('seller-progress').getByText('Sin objetivo mensual', { exact: true }),
        ).toBeVisible();
        await expect(page.getByRole('progressbar')).toHaveCount(0);
        await expect(page.getByTestId('home-alert-list')).toHaveCount(0);
        await expect(page.getByRole('link', { name: /Continuar.*borrador/ })).toHaveCount(0);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        ).toBe(true);
        await page.screenshot({ path: testInfo.outputPath('seller-home.png'), fullPage: true });
      });
    }
  }

  test('seller goal reached caps progress and preserves read-only navigation', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ['home.seller.read', 'sales.read'] });
    const home = sellerHomeFixture();
    home.compliance.compliancePercent = 120;
    home.remainingToGoal = 0;
    await page.route('**/api/v1/home/seller?*', (route) => route.fulfill({ json: home }));
    await page.goto('/');
    await expect(page.getByText('¡Alcanzaste tu objetivo mensual!')).toBeVisible();
    await expect(
      page.getByRole('progressbar', { name: 'Cumplimiento del objetivo mensual' }),
    ).toHaveAttribute('aria-valuenow', '100');
    await expect(
      page.getByTestId('seller-progress').getByText('120%', { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nueva venta' })).toHaveCount(0);
    await expect(
      page.getByTestId('seller-work-queue').getByRole('link', { name: /Ver detalle/ }),
    ).toHaveAttribute('href', /\/sales\/[^/]+$/);
  });

  test('seller zero goal shows explanation and independent operational alerts', async ({
    page,
  }) => {
    await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
    const home = sellerHomeFixture();
    home.compliance = {
      hasGoal: true,
      targetIsZero: true,
      targetValue: 0,
      compliancePercent: null,
    };
    home.returnedNeedingCorrection = [];
    await page.route('**/api/v1/home/seller?*', (route) => route.fulfill({ json: home }));
    await page.goto('/');
    await expect(
      page.getByText('Tu objetivo está configurado en cero.', { exact: false }),
    ).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(
      page.getByTestId('home-alert-list').getByText('Ventas por corregir'),
    ).toBeVisible();
  });

  test('administrative home shows priorities', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('administrative-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prioridades de hoy' })).toBeVisible();
  });

  test('supervisor home shows period filters', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPERVISOR_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('supervisor-home')).toBeVisible();
    await expect(page.getByTestId('home-period-filters')).toBeVisible();
  });

  test('super admin home is executive', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: SUPER_ADMIN_PERMISSIONS });
    await page.goto('/');
    await expect(page.getByTestId('admin-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pendientes y riesgos' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accesos rápidos' })).toBeVisible();
  });

  test('fallback home without home.* permissions', async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ['teams.read'] });
    await page.goto('/');
    await expect(page.getByTestId('fallback-home')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
  });
});
