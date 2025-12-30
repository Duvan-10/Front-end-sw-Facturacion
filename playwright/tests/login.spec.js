import { test, expect } from '@playwright/test';

test.describe('Módulo de Autenticación', () => {

  test('Debe iniciar sesión correctamente con credenciales válidas', async ({ page }) => {
    // 1. Navegar a la ruta de Login (http://localhost:5173/)
    await page.goto('/');

    // 2. Ingresar las credenciales proporcionadas
    // Playwright buscará el input por su tipo (email/password) o nombre.
    // Si tus inputs tienen name="email" y name="password", esto funcionará perfecto.
    await page.fill('input[type="email"]', 'soybot@pruebas.com');
    await page.fill('input[type="password"]', '123');

    // 3. Hacer clic en el botón de ingresar (submit)
    await page.click('button[type="submit"]');

    // 4. Validar que el login fue exitoso
    // Aquí verificamos que el sistema haya reaccionado. Por ejemplo:
    // - Que la URL haya cambiado (si redirige a /dashboard o /productos)
    // - O que el formulario de login ya no sea visible
    
    // Ejemplo genérico: Esperar a que la URL no sea la raíz exacta (indicando redirección)
    // await expect(page).not.toHaveURL('http://localhost:5173/');
  });
});