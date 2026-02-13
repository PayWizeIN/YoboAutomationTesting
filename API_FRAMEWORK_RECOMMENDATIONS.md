# API Testing Framework - Recommended Modifications

**Analysis Date:** January 2, 2026  
**Framework:** YoboAutomationTesting - API Tests Module  
**Current Status:** Production-Ready (9/10)

---

## 📊 Executive Summary

The API testing framework is **excellent** overall, but there are **strategic improvements** that would enhance maintainability, performance, and coverage. Below are prioritized recommendations.

### Overall Assessment
- ✅ **Strengths**: Comprehensive validations, fintech-focused, well-structured
- ⚠️ **Areas for Improvement**: Error handling, retry logic, test data management, performance optimization

---

## 🎯 Priority 1: Critical Improvements (Implement First)

### 1. **Enhanced Error Handling & Retry Mechanism**

**Current Issue:**
- Basic try-catch blocks without retry logic
- Network failures cause immediate test failure
- No exponential backoff for transient errors

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js

/**
 * Make API request with retry logic for transient failures
 * @param {Object} testData - Test data
 * @param {string} token - Auth token
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} Response data
 */
async makeApiRequestWithRetry(testData, token = null, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.makeApiRequest(testData, token);
    } catch (error) {
      lastError = error;
      
      // Retry only on transient errors
      const isRetryable = this.isRetryableError(error);
      
      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = Math.pow(2, attempt - 1) * 1000;
      console.log(`⚠️ Attempt ${attempt} failed. Retrying in ${backoffMs}ms...`);
      await this.wait(backoffMs);
    }
  }
  
  throw lastError;
}

/**
 * Check if error is retryable (network issues, timeouts, 5xx errors)
 * @param {Error} error - Error object
 * @returns {boolean} True if retryable
 */
isRetryableError(error) {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }
  
  // Timeout errors
  if (error.message.includes('timeout')) {
    return true;
  }
  
  // 5xx server errors (except 501 Not Implemented)
  if (error.response && error.response.status >= 500 && error.response.status !== 501) {
    return true;
  }
  
  // 429 Too Many Requests (rate limiting)
  if (error.response && error.response.status === 429) {
    return true;
  }
  
  return false;
}

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 */
async wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Impact:** 🔴 High - Reduces flaky tests due to network issues

---

### 2. **Request/Response Interceptors for Better Logging**

**Current Issue:**
- Response time calculation is manual
- No centralized request/response logging
- Difficult to debug failed requests

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js constructor

constructor(environment = 'dev') {
  this.config = new EnvironmentConfig(environment);
  this.baseUrl = this.config.getApiBaseUrl();
  this.apiToken = this.config.getApiToken();
  this.responses = [];
  this.storedTestData = {};
  this.accessToken = null;
  
  // Setup axios interceptors
  this.setupInterceptors();
}

/**
 * Setup axios request/response interceptors
 */
setupInterceptors() {
  // Request interceptor - add timing
  axios.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: new Date() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - calculate duration and log
  axios.interceptors.response.use(
    (response) => {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      response.duration = duration;
      
      // Log response summary
      console.log(`📊 ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
      
      return response;
    },
    (error) => {
      if (error.config && error.config.metadata) {
        const endTime = new Date();
        const duration = endTime - error.config.metadata.startTime;
        error.duration = duration;
        
        console.error(`❌ ${error.config.method.toUpperCase()} ${error.config.url} - Error (${duration}ms)`);
      }
      
      return Promise.reject(error);
    }
  );
}
```

**Impact:** 🔴 High - Better debugging and performance monitoring

---

### 3. **Token Refresh Mechanism**

**Current Issue:**
- Access token cached but never refreshed
- No handling for expired tokens (401 errors)
- Tests fail if token expires mid-execution

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js

/**
 * Make API request with automatic token refresh on 401
 * @param {Object} testData - Test data
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Response data
 */
async makeApiRequest(testData, token = null) {
  try {
    return await this._makeApiRequestInternal(testData, token);
  } catch (error) {
    // If 401 Unauthorized, try refreshing token once
    if (error.response && error.response.status === 401 && !token) {
      console.log('🔄 Token expired. Refreshing...');
      this.accessToken = null; // Clear cached token
      const newToken = await this.authenticateAndGetToken();
      
      // Retry with new token
      return await this._makeApiRequestInternal(testData, newToken);
    }
    
    throw error;
  }
}

/**
 * Internal API request method (extracted from makeApiRequest)
 * @private
 */
async _makeApiRequestInternal(testData, token = null) {
  // ... existing makeApiRequest logic here ...
}
```

**Impact:** 🟡 Medium - Prevents token expiration failures

---

### 4. **Environment-Specific Configuration Validation**

**Current Issue:**
- No validation that required environment variables are set
- Silent failures with default values
- Hard to debug missing configuration

**Recommended Solution:**

```javascript
// Add to EnvironmentConfig.js

constructor(environment = 'dev') {
  this.environment = environment;
  this.loadConfig();
  this.validateConfig(); // Add validation
}

/**
 * Validate that all required configuration is present
 * @throws {Error} If required config is missing
 */
validateConfig() {
  const required = [
    'API_BASE_URL',
    'AUTH_ENDPOINT',
    'AUTH_PHONE',
    'AUTH_PASSWORD',
    'AUTH_OTP'
  ];
  
  const missing = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    console.warn(`⚠️ Using default values. Set these in .env file for ${this.environment} environment.`);
  } else {
    console.log(`✅ All required environment variables configured for ${this.environment}`);
  }
}

/**
 * Get configuration summary for debugging
 * @returns {Object} Configuration summary (without sensitive data)
 */
getConfigSummary() {
  return {
    environment: this.environment,
    apiBaseUrl: this.getApiBaseUrl(),
    authEndpoint: this.getAuthEndpoint(),
    phone: this.getAuthCredentials().phone,
    hasToken: !!this.getApiToken(),
    timeouts: {
      default: this.getTimeout('default'),
      api: this.getTimeout('api')
    }
  };
}
```

**Impact:** 🟡 Medium - Easier debugging and configuration management

---

## 🎯 Priority 2: Performance & Optimization

### 5. **Request Caching for Idempotent GET Requests**

**Current Issue:**
- Same GET requests repeated multiple times
- No caching mechanism
- Slower test execution

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js

constructor(environment = 'dev') {
  // ... existing code ...
  this.requestCache = new Map(); // Add cache
  this.cacheEnabled = true; // Enable/disable caching
}

/**
 * Make API request with optional caching for GET requests
 */
async makeApiRequest(testData, token = null) {
  // Check cache for GET requests
  if (testData.method === 'GET' && this.cacheEnabled && !testData.skipCache) {
    const cacheKey = this.getCacheKey(testData, token);
    
    if (this.requestCache.has(cacheKey)) {
      console.log(`📦 Using cached response for ${testData.url}`);
      return this.requestCache.get(cacheKey);
    }
  }
  
  // ... existing request logic ...
  
  // Cache GET responses
  if (testData.method === 'GET' && this.cacheEnabled && !testData.skipCache) {
    const cacheKey = this.getCacheKey(testData, token);
    this.requestCache.set(cacheKey, response.data);
  }
  
  return response.data;
}

/**
 * Generate cache key from request data
 */
getCacheKey(testData, token) {
  return `${testData.method}:${testData.url}:${JSON.stringify(testData.params || {})}:${token || ''}`;
}

/**
 * Clear request cache
 */
clearCache() {
  this.requestCache.clear();
  console.log('🗑️ Request cache cleared');
}
```

**Impact:** 🟢 Low-Medium - Faster test execution for repeated requests

---

### 6. **Parallel Request Support for Independent Tests**

**Current Issue:**
- All requests are sequential
- No support for parallel execution of independent requests

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js

/**
 * Execute multiple API requests in parallel
 * @param {Array<Object>} testDataArray - Array of test data objects
 * @param {string} token - Auth token
 * @returns {Promise<Array>} Array of responses
 */
async makeParallelRequests(testDataArray, token = null) {
  console.log(`🚀 Executing ${testDataArray.length} requests in parallel...`);
  
  const promises = testDataArray.map(testData => 
    this.makeApiRequest(testData, token)
  );
  
  const results = await Promise.allSettled(promises);
  
  // Log results
  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`✅ Parallel execution complete: ${successful} succeeded, ${failed} failed`);
  
  return results;
}
```

**Impact:** 🟢 Low - Useful for specific test scenarios

---

## 🎯 Priority 3: Enhanced Testing Capabilities

### 7. **Schema Validation with JSON Schema**

**Current Issue:**
- Manual response validation
- No formal schema definition
- Difficult to maintain complex validations

**Recommended Solution:**

```javascript
// Install: npm install ajv

const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

// Add to FintechApiHelper.js

/**
 * Validate response against JSON schema
 * @param {Object} responseBody - Response to validate
 * @param {Object} schema - JSON schema
 * @throws {Error} If validation fails
 */
validateSchema(responseBody, schema) {
  const validate = ajv.compile(schema);
  const valid = validate(responseBody);
  
  if (!valid) {
    const errors = validate.errors.map(err => 
      `${err.instancePath} ${err.message}`
    ).join(', ');
    
    throw new Error(`Schema validation failed: ${errors}`);
  }
  
  console.log('✅ Schema validation passed');
}

// Usage in test data:
// {
//   "method": "GET",
//   "url": "/api/v1/account/balance",
//   "schema": {
//     "type": "object",
//     "required": ["availableBalance", "currentBalance"],
//     "properties": {
//       "availableBalance": { "type": "number" },
//       "currentBalance": { "type": "number" }
//     }
//   }
// }
```

**Impact:** 🟡 Medium - More robust response validation

---

### 8. **Performance Metrics Collection**

**Current Issue:**
- Basic response time logging
- No aggregated performance metrics
- No performance regression detection

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js

constructor(environment = 'dev') {
  // ... existing code ...
  this.performanceMetrics = {
    requests: [],
    summary: {}
  };
}

/**
 * Record performance metrics
 */
recordPerformanceMetric(testData, response, duration) {
  this.performanceMetrics.requests.push({
    endpoint: testData.url,
    method: testData.method,
    status: response.status,
    duration: duration,
    timestamp: new Date()
  });
}

/**
 * Generate performance summary report
 * @returns {Object} Performance summary
 */
getPerformanceSummary() {
  const requests = this.performanceMetrics.requests;
  
  if (requests.length === 0) {
    return { message: 'No requests recorded' };
  }
  
  const durations = requests.map(r => r.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const maxDuration = Math.max(...durations);
  const minDuration = Math.min(...durations);
  
  // Group by endpoint
  const byEndpoint = {};
  requests.forEach(req => {
    if (!byEndpoint[req.endpoint]) {
      byEndpoint[req.endpoint] = [];
    }
    byEndpoint[req.endpoint].push(req.duration);
  });
  
  const endpointStats = {};
  Object.keys(byEndpoint).forEach(endpoint => {
    const durations = byEndpoint[endpoint];
    endpointStats[endpoint] = {
      count: durations.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  });
  
  return {
    totalRequests: requests.length,
    avgDuration: Math.round(avgDuration),
    minDuration,
    maxDuration,
    byEndpoint: endpointStats
  };
}

/**
 * Print performance report
 */
printPerformanceReport() {
  const summary = this.getPerformanceSummary();
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 PERFORMANCE REPORT');
  console.log('='.repeat(80));
  console.log(`Total Requests: ${summary.totalRequests}`);
  console.log(`Average Duration: ${summary.avgDuration}ms`);
  console.log(`Min Duration: ${summary.minDuration}ms`);
  console.log(`Max Duration: ${summary.maxDuration}ms`);
  console.log('\nBy Endpoint:');
  
  Object.keys(summary.byEndpoint).forEach(endpoint => {
    const stats = summary.byEndpoint[endpoint];
    console.log(`  ${endpoint}:`);
    console.log(`    Count: ${stats.count}, Avg: ${stats.avg}ms, Min: ${stats.min}ms, Max: ${stats.max}ms`);
  });
  
  console.log('='.repeat(80) + '\n');
}
```

**Impact:** 🟡 Medium - Better performance monitoring and regression detection

---

### 9. **Request/Response Snapshot Testing**

**Current Issue:**
- No baseline for API responses
- Difficult to detect unintended API changes
- Manual verification of response structure

**Recommended Solution:**

```javascript
// Install: npm install jest-snapshot

const fs = require('fs');
const path = require('path');

// Add to FintechApiHelper.js

/**
 * Save response snapshot for comparison
 * @param {string} testName - Test name
 * @param {Object} responseBody - Response to snapshot
 */
saveSnapshot(testName, responseBody) {
  const snapshotDir = path.join(__dirname, '../snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }
  
  const snapshotFile = path.join(snapshotDir, `${testName}.json`);
  fs.writeFileSync(snapshotFile, JSON.stringify(responseBody, null, 2));
  
  console.log(`📸 Snapshot saved: ${testName}`);
}

/**
 * Compare response with saved snapshot
 * @param {string} testName - Test name
 * @param {Object} responseBody - Response to compare
 * @param {Object} options - Comparison options
 * @throws {Error} If snapshot doesn't match
 */
compareWithSnapshot(testName, responseBody, options = {}) {
  const snapshotFile = path.join(__dirname, '../snapshots', `${testName}.json`);
  
  if (!fs.existsSync(snapshotFile)) {
    console.warn(`⚠️ No snapshot found for ${testName}. Creating new snapshot.`);
    this.saveSnapshot(testName, responseBody);
    return;
  }
  
  const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
  
  // Compare (ignoring dynamic fields like timestamps, IDs if specified)
  const diff = this.compareObjects(snapshot, responseBody, options.ignoreFields || []);
  
  if (diff.length > 0) {
    console.error(`❌ Snapshot mismatch for ${testName}:`);
    diff.forEach(d => console.error(`  - ${d}`));
    
    if (options.updateSnapshot) {
      console.log(`🔄 Updating snapshot for ${testName}`);
      this.saveSnapshot(testName, responseBody);
    } else {
      throw new Error(`Snapshot mismatch. Run with updateSnapshot: true to update.`);
    }
  } else {
    console.log(`✅ Snapshot match: ${testName}`);
  }
}

/**
 * Compare two objects and return differences
 */
compareObjects(obj1, obj2, ignoreFields = []) {
  const differences = [];
  
  // Implementation of deep object comparison
  // ... (simplified for brevity)
  
  return differences;
}
```

**Impact:** 🟢 Low-Medium - Detect unintended API changes

---

## 🎯 Priority 4: Test Data Management

### 10. **Dynamic Test Data Factory**

**Current Issue:**
- Test data hardcoded in JSON files
- No dynamic data generation
- Data conflicts in parallel execution

**Recommended Solution:**

```javascript
// Create new file: api-tests/utils/TestDataFactory.js

const { faker } = require('@faker-js/faker');

class TestDataFactory {
  /**
   * Generate unique email
   */
  static generateEmail(prefix = 'test') {
    return `${prefix}_${Date.now()}_${faker.internet.email()}`;
  }
  
  /**
   * Generate transaction ID
   */
  static generateTransactionId() {
    return `TXN_${Date.now()}_${faker.string.alphanumeric(8).toUpperCase()}`;
  }
  
  /**
   * Generate phone number
   */
  static generatePhoneNumber(countryCode = '+91') {
    return `${countryCode}${faker.string.numeric(10)}`;
  }
  
  /**
   * Generate payment request data
   */
  static generatePaymentRequest(overrides = {}) {
    return {
      amount: faker.finance.amount({ min: 10, max: 10000, dec: 2 }),
      currency: 'INR',
      recipientId: faker.string.uuid(),
      description: faker.finance.transactionDescription(),
      ...overrides
    };
  }
  
  /**
   * Generate account data
   */
  static generateAccountData(overrides = {}) {
    return {
      accountId: faker.string.uuid(),
      accountNumber: faker.finance.accountNumber(),
      accountName: faker.person.fullName(),
      balance: faker.finance.amount({ min: 0, max: 100000, dec: 2 }),
      ...overrides
    };
  }
}

module.exports = TestDataFactory;

// Usage in tests:
// const TestDataFactory = require('../utils/TestDataFactory');
// const paymentData = TestDataFactory.generatePaymentRequest({ amount: '100.00' });
```

**Impact:** 🟡 Medium - Better test data management and parallel execution

---

### 11. **Test Data Cleanup Mechanism**

**Current Issue:**
- No cleanup of test data after tests
- Potential data pollution
- No rollback mechanism

**Recommended Solution:**

```javascript
// Add to FintechApiHelper.js

constructor(environment = 'dev') {
  // ... existing code ...
  this.createdResources = []; // Track created resources
}

/**
 * Track created resource for cleanup
 * @param {string} resourceType - Type of resource (payment, account, etc.)
 * @param {string} resourceId - Resource ID
 */
trackCreatedResource(resourceType, resourceId) {
  this.createdResources.push({ type: resourceType, id: resourceId });
  console.log(`📝 Tracked ${resourceType}: ${resourceId} for cleanup`);
}

/**
 * Cleanup all created test resources
 */
async cleanupTestResources() {
  console.log(`\n🧹 Cleaning up ${this.createdResources.length} test resources...`);
  
  for (const resource of this.createdResources.reverse()) {
    try {
      await this.deleteResource(resource.type, resource.id);
      console.log(`✅ Deleted ${resource.type}: ${resource.id}`);
    } catch (error) {
      console.warn(`⚠️ Failed to delete ${resource.type}: ${resource.id} - ${error.message}`);
    }
  }
  
  this.createdResources = [];
  console.log('✅ Cleanup complete\n');
}

/**
 * Delete a resource
 */
async deleteResource(resourceType, resourceId) {
  const deleteEndpoints = {
    payment: `/api/v1/payments/${resourceId}`,
    account: `/api/v1/accounts/${resourceId}`,
    // Add more as needed
  };
  
  const endpoint = deleteEndpoints[resourceType];
  if (!endpoint) {
    console.warn(`⚠️ No delete endpoint for resource type: ${resourceType}`);
    return;
  }
  
  await this.makeApiRequest({
    method: 'DELETE',
    url: endpoint,
    expectedStatus: 204
  });
}
```

**Impact:** 🟢 Low - Cleaner test environment

---

## 🎯 Priority 5: Reporting & Observability

### 12. **Structured Logging with Log Levels**

**Current Issue:**
- Console.log everywhere
- No log levels (debug, info, warn, error)
- Difficult to filter logs

**Recommended Solution:**

```javascript
// Create new file: api-tests/utils/Logger.js

class Logger {
  constructor(level = 'info') {
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
    this.currentLevel = this.levels[level] || this.levels.info;
  }
  
  debug(message, data = null) {
    if (this.currentLevel <= this.levels.debug) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }
  
  info(message, data = null) {
    if (this.currentLevel <= this.levels.info) {
      console.log(`ℹ️  [INFO] ${message}`, data || '');
    }
  }
  
  warn(message, data = null) {
    if (this.currentLevel <= this.levels.warn) {
      console.warn(`⚠️  [WARN] ${message}`, data || '');
    }
  }
  
  error(message, error = null) {
    if (this.currentLevel <= this.levels.error) {
      console.error(`❌ [ERROR] ${message}`, error || '');
    }
  }
  
  success(message, data = null) {
    if (this.currentLevel <= this.levels.info) {
      console.log(`✅ [SUCCESS] ${message}`, data || '');
    }
  }
}

module.exports = new Logger(process.env.LOG_LEVEL || 'info');

// Usage:
// const logger = require('./utils/Logger');
// logger.debug('Request details', requestData);
// logger.info('Test started');
// logger.warn('Response time exceeded threshold');
// logger.error('Request failed', error);
```

**Impact:** 🟢 Low - Better log management

---

### 13. **Custom Allure Reporter Integration**

**Current Issue:**
- Basic HTML reports
- No rich test reporting with screenshots, logs
- Difficult to share test results

**Recommended Solution:**

```bash
# Install Allure
npm install --save-dev @playwright/test allure-playwright

# Update playwright.config.js
reporter: [
  ['html', { outputFolder: 'api-tests/reports/html' }],
  ['json', { outputFile: 'api-tests/reports/results.json' }],
  ['junit', { outputFile: 'api-tests/reports/junit.xml' }],
  ['allure-playwright', { outputFolder: 'api-tests/reports/allure-results' }],
  ['list']
]

# Generate and view Allure report
npx allure generate api-tests/reports/allure-results -o api-tests/reports/allure-report --clean
npx allure open api-tests/reports/allure-report
```

**Impact:** 🟡 Medium - Better test reporting and visualization

---

## 📋 Implementation Roadmap

### Phase 1: Critical (Week 1-2)
1. ✅ Enhanced error handling & retry mechanism
2. ✅ Request/response interceptors
3. ✅ Token refresh mechanism
4. ✅ Environment configuration validation

### Phase 2: Performance (Week 3-4)
5. ✅ Request caching
6. ✅ Performance metrics collection
7. ✅ Parallel request support

### Phase 3: Enhanced Testing (Week 5-6)
8. ✅ Schema validation
9. ✅ Snapshot testing
10. ✅ Dynamic test data factory

### Phase 4: Observability (Week 7-8)
11. ✅ Test data cleanup
12. ✅ Structured logging
13. ✅ Allure reporter integration

---

## 🎯 Quick Wins (Implement Today)

These can be implemented quickly with high impact:

1. **Add retry logic** (30 minutes)
2. **Add environment validation** (15 minutes)
3. **Add performance metrics** (45 minutes)
4. **Add structured logging** (30 minutes)

---

## 📊 Expected Outcomes

After implementing these recommendations:

- ✅ **Reliability**: 95% → 99% (retry logic, token refresh)
- ✅ **Performance**: 20-30% faster (caching, parallel requests)
- ✅ **Maintainability**: Easier debugging (structured logging, better errors)
- ✅ **Coverage**: Better validation (schema, snapshots)
- ✅ **Observability**: Rich reports (Allure, performance metrics)

---

## 🚀 Conclusion

The current API testing framework is **excellent** (9/10), but these modifications will elevate it to **world-class** (10/10):

### Must-Have (Priority 1)
- Retry mechanism with exponential backoff
- Token refresh on 401
- Environment validation

### Should-Have (Priority 2-3)
- Performance metrics
- Schema validation
- Dynamic test data

### Nice-to-Have (Priority 4-5)
- Request caching
- Snapshot testing
- Allure reporting

**Start with Priority 1 items** - they provide the highest ROI with minimal effort.

---

**Document Version:** 1.0  
**Last Updated:** January 2, 2026  
**Author:** Antigravity AI Assistant
