import { expect, test } from '@playwright/test';
import { mockApi, USERS } from './support/api-mock';

test('users list renders mocked API data', async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto('/users');

  const table = page.getByTestId('users-table');
  await expect(table.getByText('ana.perez@altium.example')).toBeVisible();
  await expect(table.getByText('Usuario: aperez', { exact: true })).toBeVisible();
  await expect(table.getByText('Bruno Gómez')).toBeVisible();
  await expect(table.getByText('Pendiente')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nuevo usuario' })).toBeVisible();
});

test('new user previews a normalized username and shows the final assigned suffix', async ({
  page,
}) => {
  await mockApi(page, { authenticated: true });
  await page.route('**/api/v1/users', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    expect(route.request().postDataJSON()).toMatchObject({
      firstName: 'Ariel',
      lastName: 'Pérez',
      email: 'ariel@example.com',
    });
    expect(route.request().postDataJSON()).not.toHaveProperty('username');
    await route.fulfill({ status: 201, json: { ...USERS[0], username: 'aperez2' } });
  });
  await page.goto('/users');
  await page.getByRole('button', { name: 'Nuevo usuario', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nombre', { exact: true }).fill('Ariel');
  await dialog.getByLabel('Apellido', { exact: true }).fill('Pérez');
  await expect(dialog.getByLabel('Usuario de acceso')).toHaveValue('aperez');
  await expect(dialog.getByLabel('Usuario de acceso')).toHaveAttribute('readonly', '');
  await dialog.getByLabel('Correo electrónico').fill('ariel@example.com');
  await dialog.getByLabel('Rol', { exact: true }).focus();
  await dialog.getByLabel('Rol', { exact: true }).press('ArrowDown');
  await page.getByRole('option', { name: 'Vendedor', exact: true }).click();
  await dialog.getByRole('button', { name: 'Crear usuario', exact: true }).click();
  await expect(
    page.getByText('Usuario aperez2 creado como pendiente de activación.'),
  ).toBeVisible();
});
