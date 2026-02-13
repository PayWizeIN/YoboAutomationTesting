# Flexible Credential Passing - Guide

## ✅ What Changed

The `authenticateAndGetToken()` method now **accepts credentials as a parameter**, giving your test cases full control over which user to authenticate as.

---

## 🎯 Key Concept

**Before:** Helper file called `getAuthCredentials()` internally  
**After:** Test case gets credentials and passes them to helper

This allows you to:
- Use different users (super admin, end user, etc.) in different test cases
- Pass custom credentials for specific tests
- Have full control from the test case level

---

## 💻 Basic Usage

### Step 1: Import EnvironmentConfig in your test

```javascript
const FintechApiHelper = require('../utils/FintechApiHelper');
const EnvironmentConfig = require('../config/EnvironmentConfig');
```

### Step 2: Get credentials and pass to authenticateAndGetToken

```javascript
test.beforeAll(async () => {
  const environment = process.env.TEST_ENV || 'dev';
  apiHelper = new FintechApiHelper(environment);
  config = new EnvironmentConfig(environment);

  // Get credentials from config
  const credentials = config.getAuthCredentials();

  // Pass credentials to authenticateAndGetToken
  await apiHelper.authenticateAndGetToken(credentials);
});
```

---

## 📝 Different Ways to Pass Credentials

### Option 1: Use config.getAuthCredentials() (Super Admin)

```javascript
const config = new EnvironmentConfig('dev');
const credentials = config.getAuthCredentials();
await apiHelper.authenticateAndGetToken(credentials);
```

This gets credentials from `.env`:
```bash
AUTH_PHONE=+919648181964
AUTH_PASSWORD=Superadmin@paywize@1230
AUTH_OTP=123456
```

### Option 2: Define credentials directly in test

```javascript
const endUserCredentials = {
  phone: '+919876543210',
  password: 'EndUserPassword123',
  otp: '123456',
};

await apiHelper.authenticateAndGetToken(endUserCredentials);
```

### Option 3: Get from environment variables

```javascript
const credentials = {
  phone: process.env.ENDUSER_PHONE,
  password: process.env.ENDUSER_PASSWORD,
  otp: process.env.ENDUSER_OTP,
};

await apiHelper.authenticateAndGetToken(credentials);
```

### Option 4: Use a helper function

```javascript
function getUserCredentials(userType) {
  const creds = {
    superadmin: {
      phone: process.env.SUPERADMIN_PHONE || '+919648181964',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperadminPass',
      otp: '123456',
    },
    enduser: {
      phone: process.env.ENDUSER_PHONE || '+919876543210',
      password: process.env.ENDUSER_PASSWORD || 'EnduserPass',
      otp: '123456',
    },
  };
  return creds[userType];
}

// Use it
const credentials = getUserCredentials('enduser');
await apiHelper.authenticateAndGetToken(credentials);
```

---

## 🎓 Complete Examples

### Example 1: Super Admin Test

```javascript
test.describe('Super Admin Tests', () => {
  let apiHelper;
  let config;

  test.beforeAll(async () => {
    apiHelper = new FintechApiHelper('dev');
    config = new EnvironmentConfig('dev');

    // Get super admin credentials
    const credentials = config.getAuthCredentials();
    
    // Authenticate
    await apiHelper.authenticateAndGetToken(credentials);
  });

  test('Admin can access endpoint', async () => {
    const response = await apiHelper.makeApiRequest(testData);
    // Assertions...
  });
});
```

### Example 2: End User Test

```javascript
test.describe('End User Tests', () => {
  let apiHelper;

  test.beforeAll(async () => {
    apiHelper = new FintechApiHelper('dev');

    // Define end user credentials
    const credentials = {
      phone: '+919876543210',
      password: 'EndUserPassword',
      otp: '123456',
    };
    
    // Authenticate
    await apiHelper.authenticateAndGetToken(credentials);
  });

  test('User can access endpoint', async () => {
    const response = await apiHelper.makeApiRequest(testData);
    // Assertions...
  });
});
```

### Example 3: Multiple Users in Same Suite

```javascript
test.describe('Multi-User Tests', () => {
  let apiHelper;

  test.beforeAll(async () => {
    apiHelper = new FintechApiHelper('dev');
  });

  test('Test as super admin', async () => {
    const config = new EnvironmentConfig('dev');
    const credentials = config.getAuthCredentials();
    
    await apiHelper.authenticateAndGetToken(credentials);
    // Test logic...
  });

  test('Test as end user', async () => {
    const credentials = {
      phone: '+919876543210',
      password: 'EndUserPassword',
      otp: '123456',
    };
    
    await apiHelper.authenticateAndGetToken(credentials);
    // Test logic...
  });
});
```

---

## 🔧 Environment Variables Setup

Add different user credentials to your `.env`:

```bash
# Super Admin (default from config.getAuthCredentials())
AUTH_PHONE=+919648181964
AUTH_PASSWORD=Superadmin@paywize@1230
AUTH_OTP=123456

# End User
ENDUSER_PHONE=+919876543210
ENDUSER_PASSWORD=EndUserPassword123
ENDUSER_OTP=123456

# Admin User
ADMIN_PHONE=+919111111111
ADMIN_PASSWORD=AdminPassword123
ADMIN_OTP=123456
```

---

## ✨ Benefits

✅ **Flexibility** - Test cases control which user to use  
✅ **Clarity** - Credentials are visible in test case  
✅ **Reusability** - Same helper works with any credentials  
✅ **Simplicity** - No complex logic in helper file  
✅ **Control** - Easy to switch users per test

---

## 📋 API Reference

### `authenticateAndGetToken(credentials)`

**Parameters:**
- `credentials` (Object) - User credentials object
  - `phone` (string) - Phone number with country code
  - `password` (string) - User password
  - `otp` (string) - OTP code

**Returns:**
- `Promise<string>` - Access token

**Example:**
```javascript
const credentials = {
  phone: '+919648181964',
  password: 'MyPassword123',
  otp: '123456',
};

const token = await apiHelper.authenticateAndGetToken(credentials);
```

### `config.getAuthCredentials()`

**Returns:**
- Object with `{ phone, password, otp }` from environment variables

**Example:**
```javascript
const config = new EnvironmentConfig('dev');
const credentials = config.getAuthCredentials();
// Returns: { phone: '+919648181964', password: 'Superadmin@paywize@1230', otp: '123456' }
```

---

## 🎯 Summary

**Old Way:**
```javascript
// Helper called getAuthCredentials() internally
await apiHelper.authenticateAndGetToken();
```

**New Way:**
```javascript
// Test case gets credentials and passes them
const credentials = config.getAuthCredentials(); // or define directly
await apiHelper.authenticateAndGetToken(credentials);
```

**This gives you full control over which user credentials to use in each test case!** 🎉

---

**See `CREDENTIAL_EXAMPLES.js` for more examples.**
