# 🎭 Yobo Automation Testing Framework

A comprehensive **Playwright-based** automation testing framework for the Yobo fintech platform, featuring both **API testing** and **End-to-End (E2E) UI testing** with multi-browser support.

---

## 📋 Table of Contents

- [What is This?](#-what-is-this)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [Configuration](#-configuration)
- [Running Tests](#-running-tests)
- [Understanding the Project Structure](#-understanding-the-project-structure)
- [Test Reports](#-test-reports)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)

---

## 🤔 What is This?

This framework allows you to:
- ✅ **Test APIs** - Automatically test backend payment, settlement, and authentication services
- ✅ **Test UI** - Automatically test the web application's user interface (login, dashboard, etc.)
- ✅ **Multi-Browser Testing** - Run tests on Chrome, Firefox, and Safari
- ✅ **Multi-Environment** - Test on different environments (Dev, UAT/Staging)
- ✅ **Generate Reports** - Get detailed HTML reports with screenshots and videos of failures

---

## 📦 Prerequisites

Before you start, you need to install the following software on your computer:

### 1. **Node.js** (JavaScript Runtime)

Node.js is required to run this framework.

#### **For macOS:**
```bash
# Install using Homebrew (recommended)
brew install node

# OR download installer from https://nodejs.org/
```

#### **For Windows:**
1. Download the installer from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer (choose LTS version)
3. Follow the installation wizard
4. Restart your computer

#### **For Linux (Ubuntu/Debian):**
```bash
# Update package manager
sudo apt update

# Install Node.js
sudo apt install nodejs npm
```

#### **Verify Installation:**
```bash
# Check Node.js version (should be v16 or higher)
node --version

# Check npm version
npm --version
```

### 2. **Git** (Version Control)

Git is needed to clone this repository.

#### **For macOS:**
```bash
# Install using Homebrew
brew install git

# OR download from https://git-scm.com/
```

#### **For Windows:**
1. Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer
3. Use default settings

#### **For Linux:**
```bash
sudo apt install git
```

#### **Verify Installation:**
```bash
git --version
```

### 3. **Code Editor** (Optional but Recommended)

- **Visual Studio Code** - [https://code.visualstudio.com/](https://code.visualstudio.com/)
- **Sublime Text** - [https://www.sublimetext.com/](https://www.sublimetext.com/)

---

## 🚀 Installation Guide

Follow these steps **exactly** to set up the framework:

### Step 1: Clone the Repository

Open your **Terminal** (macOS/Linux) or **Command Prompt/PowerShell** (Windows) and run:

```bash
# Navigate to where you want to store the project
cd ~/Desktop  # or any folder you prefer

# Clone the repository
git clone https://github.com/PayWizeIN/YoboAutomationTesting.git

# Navigate into the project folder
cd YoboAutomationTesting
```

### Step 2: Install Dependencies

This will install all required packages (Playwright, testing libraries, etc.):

```bash
npm install
```

**What this does:**
- Downloads and installs all packages listed in `package.json`
- Creates a `node_modules` folder with all dependencies
- Takes 2-5 minutes depending on your internet speed

### Step 3: Install Playwright Browsers

Playwright needs to download browser binaries (Chrome, Firefox, Safari):

```bash
npm run install-browsers
```

**What this does:**
- Downloads Chromium, Firefox, and WebKit browsers
- Installs them in a special Playwright cache folder
- Takes 3-10 minutes depending on your internet speed
- Downloads ~300-500 MB of data

**Note:** You only need to do this once!

### Step 4: Configure Environment Variables

Create your environment configuration file:

```bash
# Copy the example file to create your .env file
cp .env.example .env
```

**For Windows (Command Prompt):**
```cmd
copy .env.example .env
```

Now **edit the `.env` file** with your actual credentials:

```bash
# Open in your code editor
code .env  # if using VS Code

# OR
nano .env  # if using terminal editor
```

**Update these values:**
```env
# API Configuration
API_DEV_BASE_URL=https://api-dev.yobo.com
API_STAGING_BASE_URL=https://api-staging.yobo.com

# UI Configuration
UI_DEV_BASE_URL=https://dev.yobo.com
UI_STAGING_BASE_URL=https://staging.yobo.com

# Test Credentials - DEV
DEV_USERNAME=your_dev_username@yobo.com
DEV_PASSWORD=your_dev_password
DEV_API_TOKEN=your_dev_api_token

# Test Credentials - STAGING
STAGING_USERNAME=your_staging_username@yobo.com
STAGING_PASSWORD=your_staging_password
STAGING_API_TOKEN=your_staging_api_token
```

**⚠️ Important:** 
- Replace the placeholder values with **real credentials** from your team
- **Never commit** the `.env` file to Git (it's already in `.gitignore`)
- Ask your team lead for the correct credentials

---

## ✅ Verify Installation

Run this quick test to make sure everything is set up correctly:

```bash
# Run a simple API test
npm run api:dev -- --grep "Get payout overview"
```

If you see:
- ✅ Green checkmarks and "PASSED" messages → **Success!**
- ❌ Red errors → See [Troubleshooting](#-troubleshooting) section

---

## ⚙️ Configuration

### Environment Files

The framework supports multiple environments:

| Environment | Description | Config File |
|------------|-------------|-------------|
| **dev** | Development environment | `.env` → `DEV_*` variables |
| **uat** | UAT/Staging environment | `.env` → `STAGING_*` variables |

### Test Data Files

Test data is stored in JSON files organized by environment:

```
api-tests/fixtures/
├── dev/
│   ├── payment-service-dev.json      # Payment API test data
│   ├── settlement-service-dev.json   # Settlement API test data
│   └── auth-service-dev.json         # Auth API test data
└── uat/
    ├── payment-service-uat.json
    ├── settlement-service-uat.json
    └── auth-service-uat.json

e2e-tests/fixtures/
├── dev/
│   └── ui-tests-dev.json             # UI test data
└── uat/
    └── ui-tests-uat.json
```

**To modify test data:**
1. Open the relevant JSON file
2. Edit the test cases
3. Save the file
4. Run tests again

---

## 🏃‍♂️ Running Tests

### Quick Reference

| What to Test | Command | Description |
|-------------|---------|-------------|
| **API Tests (Dev)** | `npm run api:dev` | Run all API tests on dev environment |
| **API Tests (UAT)** | `npm run api:uat` | Run all API tests on UAT environment |
| **E2E Tests (Dev)** | `npm run e2e:dev` | Run all UI tests on dev environment |
| **E2E Tests (UAT)** | `npm run e2e:uat` | Run all UI tests on UAT environment |
| **All Tests (Dev)** | `npm run test:dev` | Run both API and E2E tests on dev |
| **View Report** | `npm run report` | Open HTML test report in browser |

### API Testing

#### Run All API Tests (Dev Environment)
```bash
npm run api:dev
```

#### Run All API Tests (UAT Environment)
```bash
npm run api:uat
```

#### Run Specific Service Tests
```bash
# Payment service only
npm run api:payment

# Settlement service only
npm run api:settlement
```

#### Run with Interactive UI (Recommended for Debugging)
```bash
npm run api:dev:ui
```
**What this does:**
- Opens Playwright's interactive test UI
- You can see each test step
- Pause, rerun, and debug tests
- Great for learning how tests work!

#### Run with Visible Browser (Headed Mode)
```bash
npm run api:dev:headed
```
**What this does:**
- Shows the browser window during test execution
- Useful for seeing what's happening

#### Run in Debug Mode
```bash
npm run api:dev:debug
```
**What this does:**
- Pauses before each test step
- Allows you to inspect the browser
- Step through tests line by line

### E2E (UI) Testing

#### Run All E2E Tests (Dev Environment)
```bash
npm run e2e:dev
```

#### Run All E2E Tests (UAT Environment)
```bash
npm run e2e:uat
```

#### Run with Interactive UI
```bash
npm run e2e:dev:ui
```

#### Run with Visible Browser
```bash
npm run e2e:dev:headed
```

### Advanced Test Execution

#### Run Tests in Parallel (Faster)
```bash
npm run api:parallel
```
**What this does:**
- Runs 4 tests simultaneously
- Finishes much faster
- Uses more system resources

#### Run Tests Sequentially (One at a Time)
```bash
npm run api:sequential
```
**What this does:**
- Runs one test at a time
- Slower but more stable
- Better for debugging

#### Run Specific Test File
```bash
npx playwright test api-tests/test-cases/payment-service.spec.js
```

#### Run Specific Test by Name
```bash
npx playwright test --grep "Get payout overview"
```

#### Run on Specific Browser Only
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit
```

---

## 📊 Test Reports

After running tests, reports are automatically generated.

### View HTML Report

```bash
npm run report
```

**What you'll see:**
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- ⏭️ Skipped tests (yellow)
- 📸 Screenshots of failures
- 🎥 Videos of failures
- ⏱️ Test execution times
- 📈 Overall statistics

### Report Locations

```
api-tests/reports/
├── html/              # Interactive HTML report
│   └── index.html     # Open this in browser
├── results.json       # JSON format (for CI/CD)
└── junit.xml          # JUnit format (for CI/CD)
```

### Understanding Test Results

#### ✅ Passed Test
```
✓ 1️⃣ Get payout overview (2.5s)
```
- Green checkmark
- Test name
- Execution time

#### ❌ Failed Test
```
✗ 7️⃣ Unauthorized Access Test (1.2s)
  Error: Expected status 401 but got 200
  Screenshot: test-results/...screenshot.png
  Video: test-results/...video.webm
```
- Red X
- Error message
- Links to screenshot and video

---

## 📁 Understanding the Project Structure

```
YoboAutomationTesting/
│
├── 📂 api-tests/                          # API Testing
│   ├── 📂 config/
│   │   └── EnvironmentConfig.js           # Environment configuration
│   ├── 📂 fixtures/                       # Test data
│   │   ├── dev/                           # Dev environment data
│   │   └── uat/                           # UAT environment data
│   ├── 📂 test-cases/                     # Test files
│   │   ├── auth-service.spec.js           # Authentication tests
│   │   ├── payment-service.spec.js        # Payment tests
│   │   └── settlement-service.spec.js     # Settlement tests
│   ├── 📂 utils/
│   │   └── FintechApiHelper.js            # API testing helper
│   └── 📂 reports/                        # Generated reports
│
├── 📂 e2e-tests/                          # UI/E2E Testing
│   ├── 📂 config/
│   │   └── EnvironmentConfig.js           # Environment configuration
│   ├── 📂 fixtures/                       # UI test data
│   ├── 📂 pages/                          # Page Object Models
│   │   ├── LoginPage.js                   # Login page actions
│   │   └── DashboardPage.js               # Dashboard page actions
│   ├── 📂 tests/                          # Test files
│   │   └── login.spec.js                  # Login tests
│   └── 📂 utils/
│       └── BasePage.js                    # Base page class
│
├── 📂 test-results/                       # Test execution artifacts
│   ├── screenshots/                       # Failure screenshots
│   └── videos/                            # Failure videos
│
├── 📄 .env                                # Environment variables (YOU CREATE THIS)
├── 📄 .env.example                        # Environment template
├── 📄 package.json                        # Dependencies and scripts
├── 📄 playwright.config.js                # Playwright configuration
├── 📄 README.md                           # This file
└── 📄 setup.sh                            # Quick setup script (optional)
```

### Key Files Explained

| File | Purpose |
|------|---------|
| **package.json** | Lists all dependencies and test commands |
| **playwright.config.js** | Configures Playwright (browsers, timeouts, reports) |
| **.env** | Stores sensitive credentials (NOT in Git) |
| **.env.example** | Template for .env file |
| **\*.spec.js** | Test files (contain actual tests) |
| **\*Page.js** | Page Object Models (UI element selectors) |
| **FintechApiHelper.js** | API testing utilities |

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### ❌ Issue: `command not found: npm`

**Solution:**
```bash
# Node.js is not installed or not in PATH
# Install Node.js from https://nodejs.org/
# Restart your terminal after installation
```

#### ❌ Issue: `Cannot find module '@playwright/test'`

**Solution:**
```bash
# Dependencies not installed
npm install
```

#### ❌ Issue: `browserType.launch: Executable doesn't exist`

**Solution:**
```bash
# Playwright browsers not installed
npm run install-browsers
```

#### ❌ Issue: `Error: ENOENT: no such file or directory, open '.env'`

**Solution:**
```bash
# .env file doesn't exist
cp .env.example .env
# Then edit .env with your credentials
```

#### ❌ Issue: `Authentication failed! Cannot proceed with tests`

**Solution:**
1. Check your `.env` file has correct credentials
2. Verify the API base URL is correct
3. Test credentials manually in Postman/browser
4. Contact your team lead for valid credentials

#### ❌ Issue: `Error: net::ERR_CONNECTION_REFUSED`

**Solution:**
1. Check if the API/UI server is running
2. Verify the base URL in `.env` is correct
3. Check your internet connection
4. Try accessing the URL in your browser manually

#### ❌ Issue: Tests are very slow

**Solution:**
```bash
# Run tests in parallel
npm run api:parallel

# Or reduce timeout in playwright.config.js
```

#### ❌ Issue: `Port 3000 is already in use`

**Solution:**
```bash
# Kill the process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Getting Help

1. **Check test reports** - `npm run report`
2. **Run in debug mode** - `npm run api:dev:debug`
3. **Check logs** - Look at terminal output
4. **Ask your team** - Share error messages and screenshots

---

## 🎓 Advanced Usage

### Writing Your Own Tests

#### API Test Example

Create a new file: `api-tests/test-cases/my-service.spec.js`

```javascript
const { test } = require('@playwright/test');
const FintechApiHelper = require('../utils/FintechApiHelper');

test.describe('My Service API Tests', () => {
  let apiHelper;

  test.beforeAll(async () => {
    const environment = process.env.TEST_ENV || 'dev';
    apiHelper = new FintechApiHelper(environment);
    await apiHelper.authenticateAndGetToken();
  });

  test('Should get data successfully', async () => {
    const testData = {
      method: 'GET',
      url: '/api/v1/my-endpoint',
      expectedStatus: 200
    };
    
    const response = await apiHelper.makeApiRequest(testData);
    console.log('Response:', response);
  });
});
```

#### E2E Test Example

Create a new file: `e2e-tests/tests/my-feature.spec.js`

```javascript
const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('My Feature Tests', () => {
  test('Should do something', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigateToLoginPage();
    await loginPage.verifyPageLoaded();
    
    // Add your test steps here
  });
});
```

### Customizing Configuration

Edit `playwright.config.js` to:
- Change timeouts
- Add/remove browsers
- Modify report settings
- Configure screenshots/videos

### CI/CD Integration

This framework is ready for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run install-browsers
    npm run api:dev
    npm run e2e:dev

- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: api-tests/reports/
```

---

## 📚 Additional Resources

### Playwright Documentation
- [Playwright Official Docs](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

### Learning Resources
- [Playwright Tutorial](https://playwright.dev/docs/intro)
- [JavaScript Basics](https://developer.mozilla.org/en-US/docs/Learn/JavaScript)
- [API Testing Guide](https://www.postman.com/api-platform/api-testing/)

### Project-Specific Docs
- `QUICK_REFERENCE.txt` - Quick command reference
- `SETUP_SUMMARY.md` - Setup summary
- `.env.example` - Environment variables guide

---

## 🤝 Contributing

### Before Making Changes

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make your changes**
   - Add new tests
   - Update documentation
   - Fix bugs

4. **Run all tests**
   ```bash
   npm run test:dev
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add: new payment validation tests"
   git push origin feature/my-new-feature
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Create PR from your branch to `main`
   - Request review from team

---

## 📞 Support

### Need Help?

1. **Check this README** - Most answers are here
2. **Check test reports** - `npm run report`
3. **Ask your team** - Share error messages
4. **Create an issue** - On GitHub repository

### Contact

- **Team Lead:** [Your Team Lead Name]
- **QA Team:** [QA Team Email]
- **GitHub Issues:** [Repository Issues Page]

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Quick Start Checklist

Use this checklist to verify your setup:

- [ ] Node.js installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Browsers installed (`npm run install-browsers`)
- [ ] `.env` file created and configured
- [ ] First test run successfully (`npm run api:dev`)
- [ ] Report viewed (`npm run report`)

**If all checkboxes are ticked, you're ready to go! 🚀**

---

**Built with ❤️ by the Yobo QA Team** | **Powered by Playwright** 🎭
