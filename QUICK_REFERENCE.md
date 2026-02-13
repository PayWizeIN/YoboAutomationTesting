# Quick Reference Guide - Multiple Backend Services

**YoboAutomationTesting Framework**  
**Version:** 1.0  
**Last Updated:** January 7, 2026

---

## 🚀 Run Commands

### All Services
```bash
npm run api:dev              # Run all services (dev)
npm run api:staging          # Run all services (staging)
```

### Specific Service
```bash
npm run api:payment          # Payment service only
npm run api:settlement       # Settlement service only
```

### Performance Options
```bash
npm run api:parallel         # All services (faster)
npm run api:sequential       # All services (1 worker)
```

### Debug & Reports
```bash
npm run api:dev:debug        # Debug mode
npm run api:dev:ui           # UI mode
npm run report               # View test report
```

---

## ➕ Add New Service (3 Steps)

### Step 1: Copy Template
```bash
cp api-tests/test-cases/payment-service.spec.js api-tests/test-cases/my-service.spec.js
```

### Step 2: Create Fixtures
```bash
touch api-tests/fixtures/dev/my-service-dev.json
touch api-tests/fixtures/uat/my-service-uat.json
```

### Step 3: Run
```bash
npm run api:dev
# Auto-discovered and runs!
```

---

## ✅ Services Available

### Payment Service
- **Tests:** getAccountBalance, initiatePayment, getPaymentStatus, etc.
- **Run:** `npm run api:payment`

### Settlement Service (NEW)
- **Tests:** getSettlementStatus, initiateSettlement, etc.
- **Run:** `npm run api:settlement`

### Add Your Service
Follow the 3-step process above

---

## 🔐 Authentication

### Dynamic Token Generation
- ✅ Hits `auth/test/verify-login`
- ✅ Extracts `access_token`
- ✅ Cached for all tests
- ✅ No hardcoded tokens

### Credentials (from .env)
```bash
AUTH_PHONE       = +919648181964
AUTH_PASSWORD    = Superadmin@paywize@1230
AUTH_OTP         = 123456
```

---

## 🔄 Execution Flow

```
npm run api:dev
    ↓
Load fixtures (dev/uat)
    ↓
Authenticate (get token)
    ↓
Run all tests (with cached token)
    ↓
Generate report
```

---

## 📁 Key Files

### Test Files
- `api-tests/test-cases/payment-service.spec.js`
- `api-tests/test-cases/settlement-service.spec.js`

### Helpers
- `api-tests/utils/FintechApiHelper.js` (shared for all)
- `api-tests/config/EnvironmentConfig.js` (shared for all)

### Fixtures (Data-Driven)
- `api-tests/fixtures/dev/{service-name}-dev.json`
- `api-tests/fixtures/uat/{service-name}-uat.json`

### Documentation
- `API_FRAMEWORK_RECOMMENDATIONS.md` - API framework improvements
- `E2E_FRAMEWORK_RECOMMENDATIONS.md` - E2E framework improvements
- `PROJECT_ANALYSIS.md` - Complete project analysis
- `CROSS_BROWSER_ANALYSIS.md` - Multi-browser testing guide
- `MULTI_BROWSER_SUCCESS.md` - Multi-browser setup confirmation

---

## 🌍 Environments

### Dev (Default)
```bash
TEST_ENV=dev npm run api
```

### UAT/Staging
```bash
TEST_ENV=uat npm run api
```

### Production (if configured)
```bash
TEST_ENV=prod npm run api
```

---

## ⚡ Performance

| Mode | Duration | Use Case |
|------|----------|----------|
| **Parallel** (default) | 5-10 minutes | CI/CD (fast feedback) |
| **Sequential** | 15-25 minutes | Low resources |
| **Single service** | 2-3 minutes | Quick testing |

**Recommendation:**
- Use **parallel** for CI/CD (fast feedback)
- Use **sequential** for low resources

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Auth failed?** | Check `.env` credentials |
| **Fixture missing?** | Create `api-tests/fixtures/dev/service-dev.json` |
| **Tests slow?** | Use `npm run api:sequential` (lower resources) |
| **Cannot find cmd?** | `npm install && npm run install-browsers` |

---

## 📚 Documentation Index

| Need | Document |
|------|----------|
| **Quick answer?** | This file (QUICK_REFERENCE.md) |
| **API improvements?** | API_FRAMEWORK_RECOMMENDATIONS.md |
| **E2E improvements?** | E2E_FRAMEWORK_RECOMMENDATIONS.md |
| **Project overview?** | PROJECT_ANALYSIS.md |
| **Multi-browser setup?** | CROSS_BROWSER_ANALYSIS.md |
| **Multi-browser success?** | MULTI_BROWSER_SUCCESS.md |
| **Getting started?** | README.md |

---

## 🎯 Quick Start

### 1. Run All Tests
```bash
npm run api:dev
```

### 2. View Results
```bash
npm run report
```

### 3. Add More Services
Copy template and create fixtures (see "Add New Service" section above)

---

## 🚀 Ready to Test!

**Your framework supports:**
- ✅ Multiple backend services (Payment, Settlement)
- ✅ Multi-environment testing (Dev, UAT, Prod)
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Dynamic authentication
- ✅ Data-driven testing with fixtures
- ✅ Comprehensive reporting

---

## 📞 Support

For issues or questions:
1. Check test reports in `api-tests/reports/`
2. Review test logs
3. Debug with `npm run test:debug`
4. Check environment configuration in `.env`

---

**Framework Version:** 1.0  
**Last Updated:** January 7, 2026  
**Status:** Production Ready 🎉
