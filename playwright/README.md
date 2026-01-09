# Playwright E2E tests

Instrucciones rápidas:

1. En una terminal arranca el backend (puerto 8080):
   ```
   npm run s
   ```
2. En otra terminal arranca el frontend (Vite):
   ```
   npm run f
   ```
3. Desde la carpeta `playwright` instala dependencias y navegadores:
   ```
   npm install -D @playwright/test
   npx playwright install
   ```
4. Ejecuta los tests:
   ```
   npm test
   ```

Notas:
- El `baseURL` en `playwright.config.js` está configurado a `http://localhost:5173` (Vite por defecto).
- Los artefactos y reportes se generan en `playwright-results`.
