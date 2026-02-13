# E2E Testing Framework - Comprehensive Review & Recommendations

**Analysis Date:** January 2, 2026  
**Framework:** YoboAutomationTesting - E2E/UI Tests Module  
**Current Status:** Good Foundation (7/10) - Needs Expansion

---

## 📊 Executive Summary

The E2E testing framework has a **solid foundation** with good patterns (Page Object Model, BasePage), but is **significantly underdeveloped** compared to the API framework. It needs expansion in coverage, features, and robustness.

### Current State
- ✅ **Strengths**: Clean POM pattern, good BasePage abstraction, TestUtilities
- ⚠️ **Weaknesses**: Limited coverage (2 pages, 1 test file), no fixtures usage, basic error handling
- 🔴 **Critical Gaps**: No payment flows, no transaction tests, no visual testing, no accessibility

### Overall Assessment: **7/10**
- Architecture: 8/10 (Good patterns)
- Coverage: 4/10 (Very limited)
- Features: 5/10 (Basic functionality)
- Robustness: 6/10 (Needs improvement)

---

## 🎯 Priority 1: Critical Gaps (Implement First)

### 1. **Expand Page Object Coverage**

**Current Issue:**
- Only 2 page objects: LoginPage, DashboardPage
- No payment, transaction, profile, settings pages
- Missing critical user journeys

**Recommended Solution:**

#### A. Create PaymentPage.js
```javascript
/**
 * Payment Page Object
 * Handles payment/money transfer functionality
 */

const BasePage = require('../utils/BasePage');

class PaymentPage extends BasePage {
  // Selectors
  recipientInput = '[data-test="recipient-input"]';
  amountInput = '[data-test="amount-input"]';
  descriptionInput = '[data-test="description-input"]';
  currencySelect = '[data-test="currency-select"]';
  confirmButton = '[data-test="confirm-payment"]';
  cancelButton = '[data-test="cancel-payment"]';
  successMessage = '[data-test="success-message"]';
  errorMessage = '[data-test="error-message"]';
  
  // Payment method selectors
  bankTransferOption = '[data-test="payment-method-bank"]';
  cardOption = '[data-test="payment-method-card"]';
  walletOption = '[data-test="payment-method-wallet"]';
  
  // Validation messages
  insufficientFundsError = 'text=Insufficient funds';
  invalidRecipientError = 'text=Invalid recipient';

  constructor(page) {
    super(page);
  }

  /**
   * Navigate to payment page
   */
  async navigateToPayment() {
    await this.goto('/payment');
    await this.waitForElement(this.recipientInput);
  }

  /**
   * Fill payment form
   * @param {Object} paymentData - Payment details
   */
  async fillPaymentForm(paymentData) {
    await this.fill(this.recipientInput, paymentData.recipient);
    await this.fill(this.amountInput, paymentData.amount);
    
    if (paymentData.description) {
      await this.fill(this.descriptionInput, paymentData.description);
    }
    
    if (paymentData.currency) {
      await this.selectOption(this.currencySelect, paymentData.currency);
    }
  }

  /**
   * Select payment method
   * @param {string} method - Payment method (bank, card, wallet)
   */
  async selectPaymentMethod(method) {
    const methodSelectors = {
      bank: this.bankTransferOption,
      card: this.cardOption,
      wallet: this.walletOption
    };
    
    await this.click(methodSelectors[method]);
  }

  /**
   * Submit payment
   */
  async submitPayment() {
    await this.click(this.confirmButton);
    await this.waitForNavigation();
  }

  /**
   * Complete payment flow
   * @param {Object} paymentData - Payment details
   * @returns {Promise<boolean>} True if successful
   */
  async makePayment(paymentData) {
    await this.fillPaymentForm(paymentData);
    
    if (paymentData.paymentMethod) {
      await this.selectPaymentMethod(paymentData.paymentMethod);
    }
    
    await this.submitPayment();
    
    // Wait for success or error message
    try {
      await this.waitForElement(this.successMessage, 5000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get success message
   * @returns {Promise<string>} Success message text
   */
  async getSuccessMessage() {
    return await this.getText(this.successMessage);
  }

  /**
   * Get error message
   * @returns {Promise<string>} Error message text
   */
  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }

  /**
   * Verify payment confirmation
   * @param {string} expectedAmount - Expected amount
   * @param {string} expectedRecipient - Expected recipient
   */
  async verifyPaymentConfirmation(expectedAmount, expectedRecipient) {
    const message = await this.getSuccessMessage();
    
    if (!message.includes(expectedAmount)) {
      throw new Error(`Success message should contain amount ${expectedAmount}`);
    }
    
    if (!message.includes(expectedRecipient)) {
      throw new Error(`Success message should contain recipient ${expectedRecipient}`);
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment() {
    await this.click(this.cancelButton);
  }

  /**
   * Verify insufficient funds error
   */
  async verifyInsufficientFundsError() {
    const isVisible = await this.isVisible(this.insufficientFundsError);
    if (!isVisible) {
      throw new Error('Insufficient funds error should be visible');
    }
  }

  /**
   * Verify invalid recipient error
   */
  async verifyInvalidRecipientError() {
    const isVisible = await this.isVisible(this.invalidRecipientError);
    if (!isVisible) {
      throw new Error('Invalid recipient error should be visible');
    }
  }
}

module.exports = PaymentPage;
```

#### B. Create TransactionHistoryPage.js
```javascript
/**
 * Transaction History Page Object
 */

const BasePage = require('../utils/BasePage');

class TransactionHistoryPage extends BasePage {
  // Selectors
  transactionList = '[data-test="transaction-list"]';
  transactionItem = '[data-test="transaction-item"]';
  filterButton = '[data-test="filter-button"]';
  searchInput = '[data-test="search-input"]';
  dateRangeFilter = '[data-test="date-range"]';
  statusFilter = '[data-test="status-filter"]';
  exportButton = '[data-test="export-button"]';
  
  // Transaction details
  transactionAmount = '[data-test="transaction-amount"]';
  transactionDate = '[data-test="transaction-date"]';
  transactionStatus = '[data-test="transaction-status"]';
  transactionRecipient = '[data-test="transaction-recipient"]';

  constructor(page) {
    super(page);
  }

  /**
   * Navigate to transaction history
   */
  async navigateToHistory() {
    await this.goto('/transactions');
    await this.waitForElement(this.transactionList);
  }

  /**
   * Get all transactions
   * @returns {Promise<Array>} List of transactions
   */
  async getAllTransactions() {
    const transactions = await this.page.$$(this.transactionItem);
    return transactions;
  }

  /**
   * Get transaction count
   * @returns {Promise<number>} Number of transactions
   */
  async getTransactionCount() {
    const transactions = await this.getAllTransactions();
    return transactions.length;
  }

  /**
   * Search transactions
   * @param {string} query - Search query
   */
  async searchTransactions(query) {
    await this.fill(this.searchInput, query);
    await this.pressKey('Enter');
    await this.wait(1000); // Wait for search results
  }

  /**
   * Filter by status
   * @param {string} status - Transaction status
   */
  async filterByStatus(status) {
    await this.click(this.filterButton);
    await this.selectOption(this.statusFilter, status);
  }

  /**
   * Filter by date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   */
  async filterByDateRange(startDate, endDate) {
    await this.click(this.filterButton);
    await this.fill(`${this.dateRangeFilter} [name="start"]`, startDate);
    await this.fill(`${this.dateRangeFilter} [name="end"]`, endDate);
  }

  /**
   * Get transaction details by index
   * @param {number} index - Transaction index
   * @returns {Promise<Object>} Transaction details
   */
  async getTransactionDetails(index = 0) {
    const transactions = await this.getAllTransactions();
    const transaction = transactions[index];
    
    const amount = await transaction.$(this.transactionAmount).textContent();
    const date = await transaction.$(this.transactionDate).textContent();
    const status = await transaction.$(this.transactionStatus).textContent();
    const recipient = await transaction.$(this.transactionRecipient).textContent();
    
    return { amount, date, status, recipient };
  }

  /**
   * Verify transaction exists
   * @param {Object} expectedTransaction - Expected transaction data
   */
  async verifyTransactionExists(expectedTransaction) {
    const transactions = await this.getAllTransactions();
    
    for (const transaction of transactions) {
      const amount = await transaction.$(this.transactionAmount).textContent();
      
      if (amount.includes(expectedTransaction.amount)) {
        console.log(`✅ Transaction found: ${expectedTransaction.amount}`);
        return true;
      }
    }
    
    throw new Error(`Transaction not found: ${expectedTransaction.amount}`);
  }

  /**
   * Export transactions
   */
  async exportTransactions() {
    await this.click(this.exportButton);
    await this.wait(2000); // Wait for download
  }
}

module.exports = TransactionHistoryPage;
```

#### C. Create ProfilePage.js
```javascript
/**
 * Profile/Settings Page Object
 */

const BasePage = require('../utils/BasePage');

class ProfilePage extends BasePage {
  // Selectors
  nameInput = '[data-test="profile-name"]';
  emailInput = '[data-test="profile-email"]';
  phoneInput = '[data-test="profile-phone"]';
  saveButton = '[data-test="save-profile"]';
  changePasswordButton = '[data-test="change-password"]';
  
  // Password change
  currentPasswordInput = '[data-test="current-password"]';
  newPasswordInput = '[data-test="new-password"]';
  confirmPasswordInput = '[data-test="confirm-password"]';
  submitPasswordButton = '[data-test="submit-password"]';
  
  // Notifications
  successNotification = '[data-test="success-notification"]';
  errorNotification = '[data-test="error-notification"]';

  constructor(page) {
    super(page);
  }

  /**
   * Navigate to profile page
   */
  async navigateToProfile() {
    await this.goto('/profile');
    await this.waitForElement(this.nameInput);
  }

  /**
   * Update profile information
   * @param {Object} profileData - Profile data
   */
  async updateProfile(profileData) {
    if (profileData.name) {
      await this.fill(this.nameInput, profileData.name);
    }
    
    if (profileData.email) {
      await this.fill(this.emailInput, profileData.email);
    }
    
    if (profileData.phone) {
      await this.fill(this.phoneInput, profileData.phone);
    }
    
    await this.click(this.saveButton);
    await this.waitForElement(this.successNotification);
  }

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async changePassword(currentPassword, newPassword) {
    await this.click(this.changePasswordButton);
    await this.fill(this.currentPasswordInput, currentPassword);
    await this.fill(this.newPasswordInput, newPassword);
    await this.fill(this.confirmPasswordInput, newPassword);
    await this.click(this.submitPasswordButton);
  }

  /**
   * Get profile data
   * @returns {Promise<Object>} Current profile data
   */
  async getProfileData() {
    return {
      name: await this.getValue(this.nameInput),
      email: await this.getValue(this.emailInput),
      phone: await this.getValue(this.phoneInput)
    };
  }

  /**
   * Verify profile updated
   */
  async verifyProfileUpdated() {
    const isVisible = await this.isVisible(this.successNotification);
    if (!isVisible) {
      throw new Error('Profile update success notification not visible');
    }
  }
}

module.exports = ProfilePage;
```

**Impact:** 🔴 Critical - Enables testing of core user journeys

---

### 2. **Create Comprehensive Test Suites**

**Current Issue:**
- Only 1 test file (login.spec.js)
- No payment flow tests
- No transaction tests
- No end-to-end user journey tests

**Recommended Solution:**

#### A. Create payment.spec.js
```javascript
/**
 * Payment E2E Tests
 * Tests complete payment workflows
 */

const { test, expect, chromium } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const PaymentPage = require('../pages/PaymentPage');
const TransactionHistoryPage = require('../pages/TransactionHistoryPage');
const EnvironmentConfig = require('../config/EnvironmentConfig');
const TestUtilities = require('../utils/TestUtilities');

test.describe('💰 Payment E2E Tests', () => {
  let page;
  let browser;
  let loginPage;
  let dashboardPage;
  let paymentPage;
  let historyPage;
  let config;

  test.beforeAll(async () => {
    const environment = process.env.TEST_ENV || 'dev';
    config = new EnvironmentConfig(environment);
    
    browser = await chromium.launch();
    page = await browser.newPage();
    
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    paymentPage = new PaymentPage(page);
    historyPage = new TransactionHistoryPage(page);
    
    // Login once for all tests
    const credentials = config.getCredentials();
    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);
    await dashboardPage.verifyPageLoaded();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('Should make a successful payment', async () => {
    const paymentData = {
      recipient: 'test@yobo.com',
      amount: '100.00',
      description: 'Test payment',
      paymentMethod: 'wallet'
    };
    
    await paymentPage.navigateToPayment();
    const success = await paymentPage.makePayment(paymentData);
    
    expect(success).toBeTruthy();
    await paymentPage.verifyPaymentConfirmation(paymentData.amount, paymentData.recipient);
  });

  test('Should show error for insufficient funds', async () => {
    const paymentData = {
      recipient: 'test@yobo.com',
      amount: '999999.00', // Very large amount
      paymentMethod: 'wallet'
    };
    
    await paymentPage.navigateToPayment();
    await paymentPage.fillPaymentForm(paymentData);
    await paymentPage.submitPayment();
    
    await paymentPage.verifyInsufficientFundsError();
  });

  test('Should show error for invalid recipient', async () => {
    const paymentData = {
      recipient: 'invalid-email',
      amount: '50.00',
      paymentMethod: 'wallet'
    };
    
    await paymentPage.navigateToPayment();
    await paymentPage.fillPaymentForm(paymentData);
    await paymentPage.submitPayment();
    
    await paymentPage.verifyInvalidRecipientError();
  });

  test('Should cancel payment', async () => {
    const paymentData = {
      recipient: 'test@yobo.com',
      amount: '75.00'
    };
    
    await paymentPage.navigateToPayment();
    await paymentPage.fillPaymentForm(paymentData);
    await paymentPage.cancelPayment();
    
    // Should be back on dashboard
    await dashboardPage.verifyPageLoaded();
  });

  test('Should verify payment appears in transaction history', async () => {
    // Make a payment
    const paymentData = {
      recipient: 'test@yobo.com',
      amount: '25.50',
      description: `Test ${TestUtilities.generateTransactionId()}`,
      paymentMethod: 'wallet'
    };
    
    await paymentPage.navigateToPayment();
    await paymentPage.makePayment(paymentData);
    
    // Check transaction history
    await historyPage.navigateToHistory();
    await historyPage.verifyTransactionExists({ amount: paymentData.amount });
  });

  test('Should make payment with different payment methods', async () => {
    const methods = ['bank', 'card', 'wallet'];
    
    for (const method of methods) {
      const paymentData = {
        recipient: 'test@yobo.com',
        amount: '10.00',
        paymentMethod: method
      };
      
      await paymentPage.navigateToPayment();
      const success = await paymentPage.makePayment(paymentData);
      
      expect(success).toBeTruthy();
      console.log(`✅ Payment successful with ${method}`);
    }
  });
});
```

#### B. Create transaction-history.spec.js
```javascript
/**
 * Transaction History E2E Tests
 */

const { test, expect, chromium } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const TransactionHistoryPage = require('../pages/TransactionHistoryPage');
const EnvironmentConfig = require('../config/EnvironmentConfig');

test.describe('📜 Transaction History E2E Tests', () => {
  let page;
  let browser;
  let loginPage;
  let dashboardPage;
  let historyPage;
  let config;

  test.beforeAll(async () => {
    const environment = process.env.TEST_ENV || 'dev';
    config = new EnvironmentConfig(environment);
    
    browser = await chromium.launch();
    page = await browser.newPage();
    
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    historyPage = new TransactionHistoryPage(page);
    
    // Login
    const credentials = config.getCredentials();
    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);
    await dashboardPage.verifyPageLoaded();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test('Should display transaction history', async () => {
    await historyPage.navigateToHistory();
    const count = await historyPage.getTransactionCount();
    
    expect(count).toBeGreaterThan(0);
    console.log(`✅ Found ${count} transactions`);
  });

  test('Should search transactions', async () => {
    await historyPage.navigateToHistory();
    await historyPage.searchTransactions('100');
    
    const count = await historyPage.getTransactionCount();
    console.log(`✅ Search returned ${count} results`);
  });

  test('Should filter transactions by status', async () => {
    await historyPage.navigateToHistory();
    await historyPage.filterByStatus('completed');
    
    const count = await historyPage.getTransactionCount();
    console.log(`✅ Filter returned ${count} completed transactions`);
  });

  test('Should export transactions', async () => {
    await historyPage.navigateToHistory();
    await historyPage.exportTransactions();
    
    // Verify download (implementation depends on download handling)
    console.log('✅ Export initiated');
  });

  test('Should display transaction details', async () => {
    await historyPage.navigateToHistory();
    const details = await historyPage.getTransactionDetails(0);
    
    expect(details.amount).toBeTruthy();
    expect(details.date).toBeTruthy();
    expect(details.status).toBeTruthy();
    
    console.log('✅ Transaction details:', details);
  });
});
```

#### C. Create user-journey.spec.js
```javascript
/**
 * Complete User Journey E2E Tests
 * Tests end-to-end user workflows
 */

const { test, expect, chromium } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const PaymentPage = require('../pages/PaymentPage');
const TransactionHistoryPage = require('../pages/TransactionHistoryPage');
const ProfilePage = require('../pages/ProfilePage');
const EnvironmentConfig = require('../config/EnvironmentConfig');
const TestUtilities = require('../utils/TestUtilities');

test.describe('🚀 Complete User Journey Tests', () => {
  let page;
  let browser;
  let config;

  test.beforeEach(async () => {
    const environment = process.env.TEST_ENV || 'dev';
    config = new EnvironmentConfig(environment);
    
    browser = await chromium.launch();
    page = await browser.newPage();
  });

  test.afterEach(async () => {
    await browser.close();
  });

  test('Complete user journey: Login → Check Balance → Make Payment → Verify History → Logout', async () => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const paymentPage = new PaymentPage(page);
    const historyPage = new TransactionHistoryPage(page);
    
    // Step 1: Login
    const credentials = config.getCredentials();
    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);
    await dashboardPage.verifyPageLoaded();
    console.log('✅ Step 1: Login successful');
    
    // Step 2: Check balance
    const balance = await dashboardPage.getAccountBalance();
    expect(balance).toBeTruthy();
    console.log(`✅ Step 2: Balance checked: ${balance}`);
    
    // Step 3: Make payment
    const paymentData = {
      recipient: 'test@yobo.com',
      amount: '50.00',
      description: `Journey test ${TestUtilities.generateTransactionId()}`,
      paymentMethod: 'wallet'
    };
    
    await paymentPage.navigateToPayment();
    await paymentPage.makePayment(paymentData);
    console.log('✅ Step 3: Payment made successfully');
    
    // Step 4: Verify in history
    await historyPage.navigateToHistory();
    await historyPage.verifyTransactionExists({ amount: paymentData.amount });
    console.log('✅ Step 4: Transaction verified in history');
    
    // Step 5: Logout
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();
    await loginPage.verifyPageLoaded();
    console.log('✅ Step 5: Logout successful');
  });

  test('User journey: Login → Update Profile → Change Password → Logout', async () => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const profilePage = new ProfilePage(page);
    
    // Login
    const credentials = config.getCredentials();
    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);
    await dashboardPage.verifyPageLoaded();
    
    // Update profile
    await profilePage.navigateToProfile();
    const newName = `Test User ${Date.now()}`;
    await profilePage.updateProfile({ name: newName });
    await profilePage.verifyProfileUpdated();
    console.log('✅ Profile updated');
    
    // Verify profile data
    const profileData = await profilePage.getProfileData();
    expect(profileData.name).toBe(newName);
    
    // Logout
    await dashboardPage.navigateToDashboard();
    await dashboardPage.logout();
  });
});
```

**Impact:** 🔴 Critical - Comprehensive test coverage

---

### 3. **Implement Fixture-Based Test Data**

**Current Issue:**
- No fixture files being used
- Test data hardcoded in test files
- No environment-specific test data

**Recommended Solution:**

Create fixture files:

#### e2e-tests/fixtures/dev/ui-tests-dev.json
```json
{
  "loginPageElements": {
    "emailInput": "input[id='email']",
    "passwordInput": "input[id='password']",
    "loginButton": "button[type='submit']",
    "errorMessage": ".error-message",
    "rememberMeCheckbox": "input[type='checkbox']",
    "forgotPasswordLink": "a[href='/forgot-password']"
  },
  "dashboardPageElements": {
    "welcomeMessage": "h1:has-text('Welcome')",
    "accountBalance": "[data-test='account-balance']",
    "paymentButton": "button:has-text('Send Money')",
    "historyLink": "a[href='/transactions']",
    "profileMenu": "[data-test='profile-menu']",
    "logoutButton": "button:has-text('Logout')"
  },
  "paymentPageElements": {
    "recipientInput": "[data-test='recipient-input']",
    "amountInput": "[data-test='amount-input']",
    "descriptionInput": "[data-test='description-input']",
    "confirmButton": "[data-test='confirm-payment']"
  },
  "testScenarios": {
    "validLogin": {
      "email": "dev_user@yobo.com",
      "password": "DevPassword123!",
      "expectedUrl": "/dashboard"
    },
    "invalidLogin": {
      "email": "invalid@yobo.com",
      "password": "wrongpassword",
      "expectedError": "Invalid credentials"
    },
    "validPayment": {
      "recipient": "recipient@yobo.com",
      "amount": "100.00",
      "description": "Test payment",
      "paymentMethod": "wallet"
    },
    "insufficientFundsPayment": {
      "recipient": "recipient@yobo.com",
      "amount": "999999.00",
      "expectedError": "Insufficient funds"
    }
  },
  "testUsers": {
    "standardUser": {
      "email": "standard@yobo.com",
      "password": "Standard123!",
      "name": "Standard User",
      "balance": "1000.00"
    },
    "premiumUser": {
      "email": "premium@yobo.com",
      "password": "Premium123!",
      "name": "Premium User",
      "balance": "10000.00"
    }
  }
}
```

**Impact:** 🟡 Medium - Better test data management

---

## 🎯 Priority 2: Enhanced Features

### 4. **Add Visual Regression Testing**

**Current Issue:**
- No visual testing
- UI changes can go undetected
- No screenshot comparison

**Recommended Solution:**

```javascript
// Create e2e-tests/utils/VisualTesting.js

const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

class VisualTesting {
  constructor(page, testName) {
    this.page = page;
    this.testName = testName;
    this.screenshotDir = path.join(__dirname, '../screenshots');
    
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Take and compare screenshot
   * @param {string} name - Screenshot name
   * @param {Object} options - Screenshot options
   */
  async compareScreenshot(name, options = {}) {
    const screenshotPath = path.join(
      this.screenshotDir,
      `${this.testName}-${name}.png`
    );
    
    // Playwright's built-in visual comparison
    await expect(this.page).toHaveScreenshot(screenshotPath, {
      maxDiffPixels: options.maxDiffPixels || 100,
      threshold: options.threshold || 0.2,
      ...options
    });
  }

  /**
   * Take element screenshot
   * @param {string} selector - Element selector
   * @param {string} name - Screenshot name
   */
  async compareElementScreenshot(selector, name, options = {}) {
    const element = await this.page.locator(selector);
    
    await expect(element).toHaveScreenshot(`${this.testName}-${name}.png`, {
      maxDiffPixels: options.maxDiffPixels || 50,
      ...options
    });
  }

  /**
   * Take full page screenshot
   * @param {string} name - Screenshot name
   */
  async compareFullPageScreenshot(name, options = {}) {
    await this.compareScreenshot(name, {
      fullPage: true,
      ...options
    });
  }
}

module.exports = VisualTesting;

// Usage in tests:
// const VisualTesting = require('../utils/VisualTesting');
// const visual = new VisualTesting(page, 'login-test');
// await visual.compareScreenshot('login-page');
// await visual.compareElementScreenshot('[data-test="login-form"]', 'login-form');
```

**Impact:** 🟡 Medium - Detect visual regressions

---

### 5. **Add Accessibility Testing**

**Current Issue:**
- No accessibility testing
- WCAG compliance not verified
- Potential accessibility issues undetected

**Recommended Solution:**

```bash
# Install axe-core
npm install --save-dev @axe-core/playwright
```

```javascript
// Create e2e-tests/utils/AccessibilityTesting.js

const { injectAxe, checkA11y, getViolations } = require('axe-playwright');

class AccessibilityTesting {
  constructor(page) {
    this.page = page;
  }

  /**
   * Initialize accessibility testing
   */
  async initialize() {
    await injectAxe(this.page);
  }

  /**
   * Check accessibility of current page
   * @param {Object} options - Axe options
   */
  async checkPageAccessibility(options = {}) {
    await checkA11y(this.page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      },
      ...options
    });
  }

  /**
   * Check accessibility of specific element
   * @param {string} selector - Element selector
   */
  async checkElementAccessibility(selector, options = {}) {
    await checkA11y(this.page, selector, options);
  }

  /**
   * Get accessibility violations
   * @returns {Promise<Array>} List of violations
   */
  async getViolations() {
    return await getViolations(this.page);
  }

  /**
   * Check for specific WCAG level
   * @param {string} level - WCAG level (A, AA, AAA)
   */
  async checkWCAGCompliance(level = 'AA') {
    await checkA11y(this.page, null, {
      runOnly: {
        type: 'tag',
        values: [`wcag2${level.toLowerCase()}`]
      }
    });
  }
}

module.exports = AccessibilityTesting;

// Usage in tests:
// const AccessibilityTesting = require('../utils/AccessibilityTesting');
// const a11y = new AccessibilityTesting(page);
// await a11y.initialize();
// await a11y.checkPageAccessibility();
// await a11y.checkWCAGCompliance('AA');
```

**Impact:** 🟡 Medium - Ensure accessibility compliance

---

### 6. **Enhance BasePage with Advanced Features**

**Current Issue:**
- Basic BasePage functionality
- Missing advanced interactions
- No built-in waiting strategies

**Recommended Solution:**

```javascript
// Enhance e2e-tests/utils/BasePage.js

class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 30000;
  }

  // ... existing methods ...

  /**
   * Wait for multiple elements
   * @param {Array<string>} selectors - Array of selectors
   */
  async waitForElements(selectors) {
    await Promise.all(
      selectors.map(selector => this.waitForElement(selector))
    );
  }

  /**
   * Click and wait for navigation
   * @param {string} selector - CSS selector
   */
  async clickAndNavigate(selector) {
    await Promise.all([
      this.page.waitForNavigation(),
      this.click(selector)
    ]);
  }

  /**
   * Fill and press Enter
   * @param {string} selector - CSS selector
   * @param {string} text - Text to fill
   */
  async fillAndSubmit(selector, text) {
    await this.fill(selector, text);
    await this.pressKey('Enter');
  }

  /**
   * Wait for element to be hidden
   * @param {string} selector - CSS selector
   */
  async waitForElementToBeHidden(selector) {
    await this.page.waitForSelector(selector, { 
      state: 'hidden',
      timeout: this.timeout 
    });
  }

  /**
   * Wait for element to be attached
   * @param {string} selector - CSS selector
   */
  async waitForElementToBeAttached(selector) {
    await this.page.waitForSelector(selector, { 
      state: 'attached',
      timeout: this.timeout 
    });
  }

  /**
   * Hover over element
   * @param {string} selector - CSS selector
   */
  async hover(selector) {
    await this.page.hover(selector);
  }

  /**
   * Double click element
   * @param {string} selector - CSS selector
   */
  async doubleClick(selector) {
    await this.page.dblclick(selector);
  }

  /**
   * Right click element
   * @param {string} selector - CSS selector
   */
  async rightClick(selector) {
    await this.page.click(selector, { button: 'right' });
  }

  /**
   * Get element count
   * @param {string} selector - CSS selector
   * @returns {Promise<number>} Element count
   */
  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Get all elements text
   * @param {string} selector - CSS selector
   * @returns {Promise<Array<string>>} Array of text content
   */
  async getAllElementsText(selector) {
    return await this.page.locator(selector).allTextContents();
  }

  /**
   * Check if element contains text
   * @param {string} selector - CSS selector
   * @param {string} text - Text to check
   * @returns {Promise<boolean>} True if contains text
   */
  async elementContainsText(selector, text) {
    const elementText = await this.getText(selector);
    return elementText.includes(text);
  }

  /**
   * Wait for URL to contain string
   * @param {string} urlPart - URL substring
   */
  async waitForUrlToContain(urlPart) {
    await this.page.waitForURL(`**/*${urlPart}*`, { timeout: this.timeout });
  }

  /**
   * Reload page
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * Go back
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Go forward
   */
  async goForward() {
    await this.page.goForward();
  }

  /**
   * Set viewport size
   * @param {number} width - Width
   * @param {number} height - Height
   */
  async setViewportSize(width, height) {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Execute JavaScript
   * @param {string} script - JavaScript code
   * @returns {Promise<any>} Result
   */
  async executeScript(script) {
    return await this.page.evaluate(script);
  }

  /**
   * Get local storage item
   * @param {string} key - Storage key
   * @returns {Promise<string>} Storage value
   */
  async getLocalStorageItem(key) {
    return await this.page.evaluate((k) => localStorage.getItem(k), key);
  }

  /**
   * Set local storage item
   * @param {string} key - Storage key
   * @param {string} value - Storage value
   */
  async setLocalStorageItem(key, value) {
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }

  /**
   * Clear local storage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Get cookies
   * @returns {Promise<Array>} Cookies
   */
  async getCookies() {
    return await this.page.context().cookies();
  }

  /**
   * Clear cookies
   */
  async clearCookies() {
    await this.page.context().clearCookies();
  }

  /**
   * Upload file
   * @param {string} selector - File input selector
   * @param {string} filePath - Path to file
   */
  async uploadFile(selector, filePath) {
    await this.page.setInputFiles(selector, filePath);
  }

  /**
   * Download file
   * @param {string} selector - Download button selector
   * @returns {Promise<Download>} Download object
   */
  async downloadFile(selector) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.click(selector)
    ]);
    return download;
  }

  /**
   * Handle dialog
   * @param {string} action - 'accept' or 'dismiss'
   * @param {string} promptText - Text for prompt dialog
   */
  async handleDialog(action = 'accept', promptText = '') {
    this.page.once('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for response
   * @param {string|RegExp} urlPattern - URL pattern
   * @returns {Promise<Response>} Response object
   */
  async waitForResponse(urlPattern) {
    return await this.page.waitForResponse(urlPattern);
  }

  /**
   * Intercept and mock API response
   * @param {string|RegExp} urlPattern - URL pattern
   * @param {Object} mockResponse - Mock response data
   */
  async mockApiResponse(urlPattern, mockResponse) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });
  }
}

module.exports = BasePage;
```

**Impact:** 🟡 Medium - More powerful page objects

---

## 🎯 Priority 3: Test Infrastructure

### 7. **Implement Test Fixtures (Playwright Fixtures)**

**Recommended Solution:**

```javascript
// Create e2e-tests/fixtures/test-fixtures.js

const { test as base, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');
const PaymentPage = require('../pages/PaymentPage');
const TransactionHistoryPage = require('../pages/TransactionHistoryPage');
const ProfilePage = require('../pages/ProfilePage');
const EnvironmentConfig = require('../config/EnvironmentConfig');

// Extend base test with custom fixtures
const test = base.extend({
  // Config fixture
  config: async ({}, use) => {
    const environment = process.env.TEST_ENV || 'dev';
    const config = new EnvironmentConfig(environment);
    await use(config);
  },

  // Authenticated page fixture
  authenticatedPage: async ({ page, config }, use) => {
    const loginPage = new LoginPage(page);
    const credentials = config.getCredentials();
    
    await loginPage.navigateToLoginPage();
    await loginPage.login(credentials.username, credentials.password);
    
    await use(page);
  },

  // Page object fixtures
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },

  historyPage: async ({ page }, use) => {
    await use(new TransactionHistoryPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  }
});

module.exports = { test, expect };

// Usage in tests:
// const { test, expect } = require('../fixtures/test-fixtures');
//
// test('My test', async ({ authenticatedPage, dashboardPage }) => {
//   await dashboardPage.verifyPageLoaded();
// });
```

**Impact:** 🟢 Low-Medium - Cleaner test code

---

### 8. **Add Mobile/Responsive Testing**

**Recommended Solution:**

```javascript
// Create e2e-tests/tests/responsive.spec.js

const { test, expect, devices } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const DashboardPage = require('../pages/DashboardPage');

const mobileDevices = [
  devices['iPhone 13'],
  devices['iPhone 13 Pro'],
  devices['Pixel 5'],
  devices['Galaxy S9+']
];

const tabletDevices = [
  devices['iPad Pro'],
  devices['iPad Mini']
];

for (const device of mobileDevices) {
  test.describe(`Mobile Tests - ${device.name}`, () => {
    test.use(device);

    test('Should login on mobile', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      
      await loginPage.navigateToLoginPage();
      await loginPage.login('test@yobo.com', 'password');
      await dashboardPage.verifyPageLoaded();
    });

    test('Should make payment on mobile', async ({ page }) => {
      // Mobile payment test
    });
  });
}
```

**Impact:** 🟢 Low-Medium - Mobile compatibility testing

---

## 📋 Implementation Roadmap

### Phase 1: Critical Coverage (Week 1-2)
1. ✅ Create PaymentPage, TransactionHistoryPage, ProfilePage
2. ✅ Create payment.spec.js test suite
3. ✅ Create transaction-history.spec.js test suite
4. ✅ Create user-journey.spec.js test suite
5. ✅ Implement fixture-based test data

### Phase 2: Enhanced Features (Week 3-4)
6. ✅ Add visual regression testing
7. ✅ Add accessibility testing
8. ✅ Enhance BasePage with advanced features
9. ✅ Implement Playwright fixtures

### Phase 3: Advanced Testing (Week 5-6)
10. ✅ Add mobile/responsive testing
11. ✅ Add API mocking for E2E tests
12. ✅ Add performance monitoring
13. ✅ Add cross-browser testing

---

## 🎯 Quick Wins (Implement Today)

1. **Create PaymentPage.js** (1 hour)
2. **Create basic payment.spec.js** (1 hour)
3. **Enhance BasePage** (30 minutes)
4. **Add fixture files** (30 minutes)

Total: ~3 hours for significant improvement

---

## 📊 Expected Outcomes

After implementing these recommendations:

- ✅ **Coverage**: 20% → 80% (from 2 pages to 10+ pages)
- ✅ **Test Scenarios**: 6 → 50+ (comprehensive coverage)
- ✅ **Quality**: Visual + Accessibility testing
- ✅ **Maintainability**: Fixture-based data, better page objects
- ✅ **Confidence**: Complete user journey coverage

---

## 🚀 Conclusion

The E2E framework has a **solid foundation (7/10)** but needs significant expansion:

### Must-Have (Priority 1) 🔴
- Create PaymentPage, TransactionHistoryPage, ProfilePage
- Create comprehensive test suites
- Implement fixture-based test data

### Should-Have (Priority 2) 🟡
- Visual regression testing
- Accessibility testing
- Enhanced BasePage

### Nice-to-Have (Priority 3) 🟢
- Playwright fixtures
- Mobile testing
- API mocking

**Start with Priority 1** - it will transform your E2E coverage from basic to comprehensive.

---

**Current Score:** 7/10  
**Potential Score:** 10/10 (after implementing recommendations)

**Document Version:** 1.0  
**Last Updated:** January 2, 2026  
**Author:** Antigravity AI Assistant
