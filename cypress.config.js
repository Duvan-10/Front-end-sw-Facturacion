const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
    browsers: [
      {
        name: 'chrome',
        family: 'chromium',
        channel: 'stable',
        displayName: 'Chrome',
        version: '120.0.5993.117',
        majorVersion: 120,
        path: 'C:\\Users\\Duvan\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      },
    ],
  },
});