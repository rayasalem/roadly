const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Frontend (Expo web), not the API. Override: CYPRESS_BASE_URL=https://staging.example.com
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:8081',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    viewportWidth: 390,
    viewportHeight: 844,
    setupNodeEvents(_on, _config) {},
  },
});
