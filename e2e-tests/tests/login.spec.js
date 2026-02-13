/**
 * Login UI Tests
 * End-to-end tests for login functionality
 * Now supports multiple browsers (Chromium, Firefox, WebKit)
 */

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const EnvironmentConfig = require('../config/EnvironmentConfig');
const fs = require('fs');
const path = require('path');

test.describe('🔐 Login E2E Tests', () => {
  let loginPage;
  let dashboardPage;
  let config;
  let testData;

  test.beforeEach(async ({ page, browserName }) => {
    // Get environment
    const environment = process.env.TEST_ENV || 'dev';
    config = new EnvironmentConfig(environment);

    // Load test data
    const fixtureFile = path.join(
      __dirname,
      `../fixtures/${environment}/ui-tests-${environment}.json`
    );

    // Check if fixture file exists, if not use defaults
    if (fs.existsSync(fixtureFile)) {
      testData = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
    }

    // Initialize page objects with Playwright-managed page
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    console.log(`\n✅ Environment: ${environment.toUpperCase()}`);
    console.log(`🌐 Browser: ${browserName.toUpperCase()}`);
    console.log(`📍 Base URL: ${config.getUiBaseUrl()}`);
    console.log(`👤 Test User: ${config.getCredentials().username}\n`);
  });

  test('Should navigate to login page', async ({ page }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.verifyPageLoaded();
  });

  test('Should login with valid credentials', async ({ page }) => {
    const credentials = config.getCredentials();

    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);

    await dashboardPage.verifyPageLoaded();
    expect(await dashboardPage.isVisible('[data-test="account-balance"]')).toBeTruthy();
  });

  test('Should display error on invalid login', async ({ page }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.login('invalid@yobo.com', 'wrongpassword');

    const isErrorVisible = await loginPage.isErrorVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test('Should logout successfully', async ({ page }) => {
    const credentials = config.getCredentials();

    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);
    await dashboardPage.verifyPageLoaded();

    await dashboardPage.logout();

    // Should be back on login page
    await loginPage.verifyPageLoaded();
  });

  test('Should remember user when checkbox is checked', async ({ page }) => {
    const credentials = config.getCredentials();

    await loginPage.navigateToLoginPage();
    await loginPage.loginWithRemember(credentials.username, credentials.password);

    await dashboardPage.verifyPageLoaded();
  });

  test('Should navigate to forgot password', async ({ page }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.clickForgotPassword();

    // Verify navigation to forgot password page
    const url = await loginPage.getUrl();
    expect(url).toContain('/forgot-password');
  });
});

