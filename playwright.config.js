const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['**/api-tests/**/*.spec.js', '**/e2e-tests/**/*.spec.js'],

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'api-tests/reports/html' }],
    ['json', { outputFile: 'api-tests/reports/results.json' }],
    ['junit', { outputFile: 'api-tests/reports/junit.xml' }],
    ['list']
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for API and E2E tests */
  projects: [
    // API Tests - Run once (no browser needed)
    {
      name: 'api-tests',
      testMatch: '**/api-tests/**/*.spec.js',
      use: {
        // API tests don't need browser context
      },
    },

    // E2E Tests - Run on multiple browsers
    // {
    //   name: 'e2e-chromium',
    //   testMatch: '**/e2e-tests/**/*.spec.js',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },
    // {
    //   name: 'e2e-firefox',
    //   testMatch: '**/e2e-tests/**/*.spec.js',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },
    // {
    //   name: 'e2e-webkit',
    //   testMatch: '**/e2e-tests/**/*.spec.js',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1920, height: 1080 },
    //   },
    // },

    // Mobile Browsers for E2E (Optional - uncomment to enable)
    // {
    //   name: 'e2e-mobile-chrome',
    //   testMatch: '**/e2e-tests/**/*.spec.js',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'e2e-mobile-safari',
    //   testMatch: '**/e2e-tests/**/*.spec.js',
    //   use: { ...devices['iPhone 13'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
