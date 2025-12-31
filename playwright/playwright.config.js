const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-results/html-report' }],
    ['junit', { outputFile: 'playwright-results/results.xml' }]
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm --prefix .. run f:test',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: true
  },
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    trace: 'on-first-retry'
  }
});
