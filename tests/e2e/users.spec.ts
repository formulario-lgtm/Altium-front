import { expect, test } from '@playwright/test';
import { mockApi } from './support/api-mock';

test('users list renders mocked API data', async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto('/users');

  const table = page.getByTestId('users-table');
  await expect(table.getByText('ana.perez@altium.example')).toBeVisible();
  await expect(table.getByText('Bruno Gómez')).toBeVisible();
  await expect(table.getByText('Pendiente')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo usuario' })).toBeVisible();
});
