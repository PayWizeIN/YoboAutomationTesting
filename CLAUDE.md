# CLAUDE.md

This file provides guidance for Claude Code and AI assistants when working with the YoboAutomationTesting framework.

## Project Overview

**YoboAutomationTesting** is a comprehensive Playwright automation framework for Yobo fintech with:

- 🔧 **API Testing** - Data-driven API tests with financial compliance validations
- 🎯 **E2E UI Testing** - Complete user journey testing with page object models
- 🌍 **Multi-Environment Support** - Dev and Staging with easy configuration
- 🛡️ **Fintech Security** - PCI DSS compliance, data masking, sensitive field validation
- 🚀 **CI/CD Ready** - GitHub Actions integration with comprehensive reporting

## Architecture

### Core Components

1. **API Testing Framework** (`utils/FintechApiHelper.js`)
   - Axios-based API client for Playwright tests
   - Financial validations: monetary amounts, transaction IDs, data masking
   - Security header validation
   - Rate limiting tests
   - Response time monitoring

2. **UI Testing Framework**
   - Page Object Model pattern (`e2e-tests/pages/`)
   - Base page with common actions (`utils/BasePage.js`)
   - Login, Dashboard, Payment, Transaction history pages
   - Page-specific selectors and methods

3. **Configuration** (`config/EnvironmentConfig.js`)
   - Multi-environment support (dev, staging)
   - Dynamic URL and credential loading
   - Timeout management

4. **Test Utilities** (`utils/TestUtilities.js`)
   - Data generation (emails, transaction IDs, UUIDs)
   - Validation helpers (email, phone)
   - Date/time utilities
   - Retry mechanisms

5. **Test Data** (`fixtures/`)
   - Environment-specific JSON data
   - API request/response structure
   - UI page element selectors
   - Test scenarios

## Quick Commands

### Setup
```bash
npm install                    # Install dependencies
npm run install-browsers      # Install Playwright browsers
cp .env.example .env          # Setup environment file
```

### Running Tests
```bash
npm run api:dev              # Run API tests on DEV
npm run api:staging          # Run API tests on STAGING
npm run e2e:dev              # Run E2E tests on DEV
npm run e2e:staging          # Run E2E tests on STAGING
npm run test:dev             # Run all tests on DEV
npm run test:ui              # Interactive UI mode
npm run test:debug           # Debug mode
npm run test:headed          # Visible browser
```

### Reports
```bash
npm run report               # Open HTML report
```

## Adding New Tests

### New API Test

1. **Add test data** to `fixtures/{env}/payment-service-{env}.json`:
```json
{
  "newEndpoint": {
    "method": "GET",
    "url": "/api/v1/endpoint",
    "expectedStatus": 200,
    "expectedBody": { ... },
    "validateAmounts": true,
    "amountFields": ["field1", "field2"]
  }
}
```

2. **Add test** to `api-tests/payment-service.spec.js`:
```javascript
test('Should test new endpoint', async () => {
  const response = await apiHelper.makeApiRequest(
    testData.newEndpoint,
    apiHelper.apiToken
  );
  expect(response.status).toBe(200);
});
```

### New E2E Test

1. **Create page object** in `e2e-tests/pages/NewPage.js`:
```javascript
const BasePage = require('../../utils/BasePage');

class NewPage extends BasePage {
  selector1 = '#element1';
  selector2 = '#element2';

  async doSomething() {
    await this.click(this.selector1);
  }
}

module.exports = NewPage;
```

2. **Add test data** to `fixtures/{env}/ui-tests-{env}.json`:
```json
{
  "newPageElements": {
    "selector1": "#element1",
    "selector2": "#element2"
  }
}
```

3. **Create test file** `e2e-tests/tests/new.spec.js`:
```javascript
const { test, expect } = require('@playwright/test');
const NewPage = require('../pages/NewPage');

test.describe('New Feature Tests', () => {
  let page;
  let newPage;

  test.beforeAll(async () => {
    const browser = await chromium.launch();
    page = await browser.newPage();
    newPage = new NewPage(page);
  });

  test('Should do something', async () => {
    await newPage.doSomething();
    // assertions...
  });
});
```

## Fintech-Specific Validations

### Monetary Amount Validation

```javascript
// Automatically validates in FintechApiHelper:
// ✅ Not negative
// ✅ Valid number format
// ✅ Max 2 decimal places
// ✅ No overflow

testData: {
  validateAmounts: true,
  amountFields: ["amount", "balance", "fee"]
}
```

### Transaction ID Validation

```javascript
// Pattern: /^[A-Z0-9_-]{10,}$/i
// Examples: TXN_123456789, txn-abc-def-123

testData: {
  validateTransactionIds: true,
  transactionIdFields: ["transactionId", "referenceId"]
}
```

### Sensitive Data Masking

```javascript
// Validates that PII/PCI data is masked:
// ✅ Credit card numbers masked
// ✅ Account numbers masked
// ✅ Email addresses masked (if needed)

testData: {
  validateDataMasking: true,
  sensitiveFields: ["cardNumber", "accountNumber", "ssn"]
}
```

## Environment Management

### Adding New Environment

1. **Update .env**:
```bash
API_NEW_ENV_BASE_URL=https://api-newenv.yobo.com
UI_NEW_ENV_BASE_URL=https://newenv.yobo.com
NEWENV_USERNAME=user@yobo.com
NEWENV_PASSWORD=password
NEWENV_API_TOKEN=token
```

2. **Create fixtures**:
```
fixtures/newenv/
├── payment-service-newenv.json
└── ui-tests-newenv.json
```

3. **Run tests**:
```bash
npm run api:newenv
npm run e2e:newenv
```

## CI/CD Pipeline

### GitHub Actions Workflow

Defined in `.github/workflows/tests.yml`:

- Triggers: push, pull_request, schedule (daily)
- Runs API and E2E tests on dev & staging
- Generates HTML, JSON, JUnit reports
- Uploads artifacts
- Publishes test results

### Adding to CI/CD

1. **Environment Secrets** in GitHub:
   - Set `DEV_API_TOKEN`, `STAGING_API_TOKEN`
   - Set credentials if needed

2. **Modify Workflow**:
   - Edit `.github/workflows/tests.yml`
   - Add new environment or trigger conditions

## Code Style

### API Helper Usage

```javascript
// ✅ Good - Let helper do validation
const response = await apiHelper.makeApiRequest(testData, token);

// ✅ Good - Use helper methods
apiHelper.validateMonetaryAmounts(responseBody, amountFields);

// ❌ Bad - Manual validation
if (response.status !== 200) throw new Error(...);
```

### Page Object Pattern

```javascript
// ✅ Good - Encapsulate selectors
class LoginPage extends BasePage {
  emailInput = 'input[id="email"]';
  async fillEmail(text) {
    await this.fill(this.emailInput, text);
  }
}

// ❌ Bad - Direct selector access
await page.fill('input[id="email"]', text);
```

### Test Structure

```javascript
test('Should do something', async () => {
  // Arrange - Setup
  const data = { ... };

  // Act - Execute
  const result = await function(data);

  // Assert - Verify
  expect(result).toBe(expected);
});
```

## Troubleshooting

### Test Failures

1. **Check environment**: `echo $TEST_ENV`
2. **Verify .env file**: `cat .env`
3. **View reports**: Check `reports/html/index.html`
4. **Debug mode**: `npm run test:debug`
5. **Check logs**: Look for error messages in terminal

### API Issues

- Verify base URLs in EnvironmentConfig
- Check auth tokens in fixtures
- Validate API response structure
- Enable verbose logging

### UI Issues

- Verify selectors in page objects
- Use headed mode: `npm run test:headed`
- Take screenshots: `await page.screenshot()`
- Check for timeouts

## Performance Optimization

### Current Settings

- Default timeout: 30000ms
- API timeout: 15000ms
- Navigation timeout: 30000ms
- Retries: 2 (CI only)
- Workers: 1 (CI), Multiple (local)

### Optimization Tips

1. **Use data-test attributes** instead of complex selectors
2. **Parallelize tests** by splitting into separate files
3. **Reduce fixture data** size if loading is slow
4. **Optimize selectors** for performance
5. **Mock external APIs** when possible

## Team Guidelines

### Before Committing

- ✅ Run tests: `npm run test:dev`
- ✅ Check for lint issues: `npm run lint`
- ✅ Review fixture data
- ✅ Update documentation

### PR Requirements

- ✅ All tests pass
- ✅ New tests for new features
- ✅ Updated fixtures if needed
- ✅ Updated CLAUDE.md or README.md

### Naming Conventions

- Test files: `*.spec.js`
- Page objects: `PascalCase.js` (e.g., `LoginPage.js`)
- Fixtures: `kebab-case.json` (e.g., `payment-service-dev.json`)
- Helper classes: `PascalCase.js` (e.g., `FintechApiHelper.js`)

## Useful Links

- **Playwright Docs**: https://playwright.dev
- **Jest/Testing**: https://jestjs.io
- **Axios Docs**: https://axios-http.com
- **Node.js**: https://nodejs.org

---

**Last Updated**: December 2024
**Framework Version**: 1.0.0
**Author**: Yobo QA Team
