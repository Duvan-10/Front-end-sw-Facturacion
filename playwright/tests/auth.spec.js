const { test, expect } = require('@playwright/test');

test('registro y login — flujo básico', async ({ page }) => {
  // Abre la app (confía en que sirves el frontend en http://localhost:5173)
  await page.goto('/');

  // Página de login por defecto
  await expect(page.locator('text=Accede a tu cuenta')).toBeVisible();

  // Ir a registro y completar formulario
  await page.click('.register-link');
  const timestamp = Date.now();
  const email = `test+${timestamp}@example.com`;

  await page.fill('input[placeholder="Ej. Juan Pérez"]', 'Test User');
  await page.fill('input[placeholder="Tu número de cédula"]', '1234567890');
  await page.fill('input[placeholder="correo@ejemplo.com"]', email);
  await page.fill('input[placeholder="••••••••"]', 'Test1234!');

  await page.click('button:has-text("Completar Registro")');

  // Se muestra mensaje de registro exitoso
  await expect(page.locator('text=Registro exitoso')).toBeVisible({ timeout: 5000 });

  // Volver al login y autenticarse
  await page.fill('input[placeholder="correo@ejemplo.com"]', email);
  await page.fill('input[placeholder="••••••••"]', 'Test1234!');
  await page.click('button:has-text("Iniciar sesión")');

  // Debe redirigir al Home
  await expect(page.locator('text=Utiliza el menú superior')).toBeVisible({ timeout: 5000 });
});
