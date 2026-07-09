const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4174',
    trace: 'on-first-retry',
  },
  webServer: process.env.CI ? undefined : {
    command: 'node server.js',
    url: 'http://localhost:4174',
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
