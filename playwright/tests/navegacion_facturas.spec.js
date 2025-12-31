import { test, expect } from '@playwright/test';

test.describe('Flujo de Navegación', () => {

  test.only('Validar que la fecha del formulario coincida con la fecha actual', async ({ page }) => {
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

    try {
      // 5. PREPARAR Y EJECUTAR APERTURA DE NUEVA PESTAÑA
      console.log('[DEBUG] Preparando para esperar el evento "popup"...');
      const pagePromise = page.context().waitForEvent('popup', { timeout: 7000 }); // Aumentamos un poco el timeout
      
      console.log('[DEBUG] Haciendo clic en "Crear Nueva Factura"...');
      await page.getByRole('button', { name: 'Crear Nueva Factura' }).click();

      console.log('[DEBUG] Clic realizado. Esperando que la promesa de la nueva pestaña se resuelva...');
      const newPage = await pagePromise; // Obtenemos la referencia a la nueva pestaña
      console.log('[DEBUG] ¡Nueva pestaña detectada con éxito!');

      // --- A partir de aquí, todas las acciones se hacen en 'newPage' ---

      // 6. VALIDAR URL DEL FORMULARIO en la nueva pestaña
      await expect(newPage).toHaveURL('http://localhost:5173/facturas/crear');

      // 7. VALIDAR QUE LA FECHA SEA LA DEL DÍA ACTUAL
      const fechaActual = new Date().toISOString().split('T')[0];
      await expect(newPage.locator('label.Fecha input')).toHaveValue(fechaActual);
    } catch (error) {
      console.error('\n[DEBUG] ERROR: El evento "popup" no fue detectado. Esto confirma que no se abrió una nueva pestaña. Revisa la traza de Playwright para ver la navegación real.\n');
      throw error; // Volvemos a lanzar el error para que la prueba falle como se espera.
    }
  });
});