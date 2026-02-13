# Yobo Automation Testing Framework

Comprehensive Playwright automation framework for Yobo fintech with **API testing** and **End-to-End UI testing** built for excellence.

## 📋 Overview

This framework combines powerful automation testing capabilities with fintech-specific validations:

- 🔧 **API Testing** - Data-driven API tests with financial compliance validations
- 🎯 **E2E UI Testing** - Complete user journey testing with page object models
- 🌍 **Multi-Environment** - Dev and Staging environments with easy switching
- 🛡️ **Security Focus** - PCI DSS compliance, data masking, sensitive field validation
- 📊 **Financial Validations** - Monetary amount validation, transaction ID validation
- 🚀 **CI/CD Ready** - GitHub Actions integration with automated reporting
- 📈 **Comprehensive Reporting** - HTML, JSON, and JUnit reports

## 🚀 Quick Start

### Prerequisites

```bash
# macOS
brew install node

# Windows or Linux
# Download from https://nodejs.org/
```

### Installation

```bash
# Clone repository
git clone <repository-url>
cd YoboAutomationTesting

# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers
```

### Setup Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
# API_DEV_BASE_URL, API_STAGING_BASE_URL, UI_DEV_BASE_URL, UI_STAGING_BASE_URL
# DEV_USERNAME, DEV_PASSWORD, DEV_API_TOKEN
# STAGING_USERNAME, STAGING_PASSWORD, STAGING_API_TOKEN
```

## 📁 Project Structure

```
YoboAutomationTesting/
├── api-tests/                      # API automation tests
│   ├── payment-service.spec.js    # Payment endpoint tests
│   └── ...
├── e2e-tests/                      # UI/E2E tests
│   ├── pages/                      # Page objects
│   │   ├── LoginPage.js           # Login page object
│   │   ├── DashboardPage.js       # Dashboard page object
│   │   └── ...
│   └── tests/                      # Test scenarios
│       ├── login.spec.js          # Login tests
│       └── ...
├── utils/                          # Test utilities
│   ├── FintechApiHelper.js        # API testing helper
│   ├── BasePage.js                # Base page object
│   ├── TestUtilities.js           # Common utilities
│   └── ...
├── config/                         # Configuration
│   ├── EnvironmentConfig.js       # Environment management
│   └── ...
├── fixtures/                       # Test data
│   ├── dev/                       # DEV environment data
│   │   ├── payment-service-dev.json
│   │   └── ui-tests-dev.json
│   └── staging/                   # STAGING environment data
│       ├── payment-service-staging.json
│       └── ui-tests-staging.json
├── reports/                        # Test reports (generated)
├── playwright.config.js            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── .env                           # Environment variables
```

## 🏃‍♂️ Running Tests

### API Tests

```bash
# Run DEV API tests
npm run api:dev

# Run STAGING API tests
npm run api:staging

# Run with UI (interactive)
npm run api:dev:ui

# Run with headed browser (visible)
npm run api:dev:headed
```

### E2E Tests

```bash
# Run DEV E2E tests
npm run e2e:dev

# Run STAGING E2E tests
npm run e2e:staging

# Run with UI (interactive)
npm run e2e:dev:ui

# Run with headed browser
npm run e2e:dev:headed
```

### All Tests

```bash
# Run all tests (dev)
npm run test:dev

# Run all tests (staging)
npm run test:staging

# Run all tests with UI
npm run test:ui

# Debug mode
npm run test:debug
```

## 🛠️ Advanced Features

### API Helper (FintechApiHelper)

The `FintechApiHelper` class provides comprehensive API testing with fintech-specific validations:

```javascript
const apiHelper = new FintechApiHelper('dev');

// Make API request with automatic validation
await apiHelper.makeApiRequest(testData, authToken);

// Validates:
// ✅ Status codes
// ✅ Response times
// ✅ Security headers
// ✅ Monetary amounts (precision, negatives, decimals)
// ✅ Transaction IDs (format validation)
// ✅ Sensitive data masking (PCI DSS)
// ✅ Response body structure
// ✅ Non-empty fields
```

### Page Object Model

All page objects extend `BasePage` with common functionality:

```javascript
class MyPage extends BasePage {
  async click(selector) { ... }
  async fill(selector, text) { ... }
  async getText(selector) { ... }
  async waitForElement(selector) { ... }
  async isVisible(selector) { ... }
  // ... and more
}
```

### Test Utilities

Comprehensive utility functions for tests:

```javascript
const TestUtilities = require('./utils/TestUtilities');

TestUtilities.generateEmail('user');           // user_123456@yobo.com
TestUtilities.generateTransactionId();         // TXN_123456_ABC123
TestUtilities.generateMobileNumber();          // +981234567890
TestUtilities.formatCurrency(100.5);           // 100.50
TestUtilities.validateEmail('test@yobo.com');  // true
```

## 📊 Test Data

Test data is organized by environment in JSON fixtures:

**API Test Data Structure:**
```json
{
  "getAccountBalance": {
    "method": "GET",
    "url": "/api/v1/accounts/dev-12345/balance",
    "expectedStatus": 200,
    "expectedBody": { ... },
    "validateAmounts": true,
    "amountFields": ["availableBalance", "currentBalance"],
    "validateTransactionIds": true
  }
}
```

**UI Test Data Structure:**
```json
{
  "loginPageElements": {
    "emailInput": "input[id='email']",
    "passwordInput": "input[id='password']",
    "loginButton": "button[type='submit']"
  },
  "testScenarios": {
    "validLogin": {
      "email": "user@yobo.com",
      "password": "password",
      "expectedUrl": "/dashboard"
    }
  }
}
```

## 🛡️ Security & Compliance

### Fintech Validations

- **Monetary Amount Validation**: Checks precision, prevents negatives, validates decimals
- **Transaction ID Validation**: Format and pattern validation
- **Sensitive Data Masking**: Ensures PCI DSS compliance
- **Security Headers**: Validates CORS, X-Frame-Options, etc.
- **Rate Limiting**: Tests DDoS protection
- **SQL Injection Prevention**: Input validation testing

### Environment Management

```bash
# Test data is isolated by environment
# - Dev: fixtures/dev/
# - Staging: fixtures/staging/

# Each environment has its own:
# - Base URLs
# - API tokens
# - Test credentials
# - Test data
```

## 📈 Reports

Tests generate multiple report formats:

- **HTML Report**: `reports/html/index.html` (interactive)
- **JSON Report**: `reports/results.json` (programmatic)
- **JUnit Report**: `reports/junit.xml` (CI/CD integration)
- **Screenshots**: `reports/` (failure screenshots)
- **Videos**: `reports/` (failure videos)

View HTML report:
```bash
npm run report
```

## 🚀 CI/CD Integration

GitHub Actions workflow (`.github/workflows/tests.yml`):

- ✅ Runs on push to main/develop
- ✅ Runs on pull requests
- ✅ Daily scheduled runs
- ✅ Tests both dev and staging
- ✅ Generates artifacts
- ✅ Publishes test results

## 📚 Best Practices

### Writing Tests

```javascript
test('Should complete payment successfully', async () => {
  // Arrange - Setup test data
  const testData = {
    amount: '100.00',
    recipient: 'user@yobo.com'
  };

  // Act - Perform action
  const response = await apiHelper.makeApiRequest(testData);

  // Assert - Verify results
  expect(response.status).toBe(201);
  expect(response.data.status).toBe('pending');
});
```

### Test Data Management

```javascript
// ✅ Use fixtures for static data
const testData = loadFixture('payment-service-dev.json');

// ✅ Use TestUtilities for dynamic data
const email = TestUtilities.generateEmail('user');
const txnId = TestUtilities.generateTransactionId();

// ❌ Avoid hardcoding credentials or test data
```

### Page Objects

```javascript
// ✅ Keep selectors in page object
// ✅ Create methods for user actions
// ✅ Return data or other page objects
// ❌ Don't add assertions in page objects

class PaymentPage extends BasePage {
  async selectRecipient(email) {
    await this.fill(this.recipientInput, email);
  }

  async confirmPayment() {
    await this.click(this.confirmButton);
    return new PaymentConfirmationPage(this.page);
  }
}
```

## 🐛 Debugging

```bash
# Run single test file
npx playwright test api-tests/payment-service.spec.js

# Run specific test
npx playwright test -g "Should get account balance"

# Debug mode (interactive)
npm run test:debug

# Headed mode (see browser)
npm run test:headed

# UI mode (best for debugging)
npm run test:ui
```

## 📖 Documentation Files

- `CLAUDE.md` - AI assistant guidance
- `README.md` - This file
- `.env.example` - Environment variables template

## 🤝 Contributing

1. Create feature branch
2. Add tests for new functionality
3. Ensure all tests pass
4. Submit pull request

## 📞 Support

For issues or questions:
- Check test reports in `reports/`
- Review test logs
- Debug with `npm run test:debug`
- Check environment configuration

## 📄 License

MIT

---

**Built with ❤️ for Yobo Fintech** 🏦
