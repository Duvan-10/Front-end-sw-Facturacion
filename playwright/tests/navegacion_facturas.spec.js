import { test, expect } from '@playwright/test';

test.describe('Flujo de Navegación', () => {

  test('Validar que la fecha del formulario coincida con la fecha actual', async ({ page }) => {
    // 1. INICIO DE SESIÓN
    await page.goto('/');
    // Usamos los selectores más específicos del código de ejemplo para mayor robustez
    await page.getByRole('textbox', { name: 'correo@ejemplo.com' }).fill('soybot@pruebas.com');
    await page.getByRole('textbox', { name: '••••••••' }).fill('123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // 2. VALIDAR REDIRECCIÓN AL HOME
    // Esperamos hasta que la URL contenga "/home"
    await expect(page).toHaveURL(/.*\/home/);

    // 3. SELECCIONAR MÓDULO DE FACTURAS
    await page.getByRole('link', { name: 'Facturas' }).click();

    // 4. VALIDAR INGRESO AL MÓDULO
    // Verificamos que la URL haya cambiado a la sección de facturas
    await expect(page).toHaveURL(/.*factura/);

    // 5. PREPARAR Y EJECUTAR APERTURA DE NUEVA PESTAÑA
    const pagePromise = page.context().waitForEvent('popup');
    await page.getByRole('button', { name: 'Crear Nueva Factura' }).click();
    const newPage = await pagePromise; // Obtenemos la referencia a la nueva pestaña

    // --- A partir de aquí, todas las acciones se hacen en 'newPage' ---

    // 6. VALIDAR URL DEL FORMULARIO en la nueva pestaña
    await expect(newPage).toHaveURL('http://localhost:5173/facturas/crear');

    // 7. VALIDAR QUE LA FECHA SEA LA DEL DÍA ACTUAL
    const fechaActual = new Date().toISOString().split('T')[0];
    await expect(newPage.locator('label.Fecha input')).toHaveValue(fechaActual);
  });
});