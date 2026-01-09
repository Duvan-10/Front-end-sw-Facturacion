import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('textbox', { name: 'correo@ejemplo.com' }).click();
  await page.getByRole('textbox', { name: 'correo@ejemplo.com' }).fill('soybot@pruebas.com');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('123');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.getByRole('link', { name: 'Facturas' }).click();
  const page2Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Crear Nueva Factura' }).click();
  const page2 = await page2Promise;
});