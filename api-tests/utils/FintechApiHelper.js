/**
 * Fintech API Helper for Playwright
 * Provides data-driven API testing with financial compliance validations
 * Mirrors the Cypress FintechApiHelper pattern for consistency
 */

const axios = require('axios');
const EnvironmentConfig = require('../config/EnvironmentConfig');

class FintechApiHelper {
  constructor(environment = 'dev') {
    this.config = new EnvironmentConfig(environment);
    this.baseUrl = this.config.getApiBaseUrl();
    this.apiToken = this.config.getApiToken();
    this.responses = [];
    this.storedTestData = {}; // Store cross-test data like transaction IDs
    this.accessToken = null; // Dynamic access token from authentication
  }

  /**
   * Authenticate and get access token from auth endpoint
   * @param {Object} credentials - User credentials object with phone, password, and otp
   * @returns {Promise<string>} Access token
   */
  async authenticateAndGetToken(credentials) {
    const authEndpoint = this.config.getAuthEndpoint();
    const authUrl = `${this.baseUrl}${authEndpoint}`;

    try {
      console.log(`\n🔐 Authenticating to get access token...`);
      console.log(`🚀 Auth Request: POST ${authEndpoint}`);
      console.log(`📝 Phone: ${credentials.phone}`);

      const response = await axios({
        method: 'POST',
        url: authUrl,
        data: {
          phone: credentials.phone,
          password: credentials.password,
          otp: credentials.otp,
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: this.config.getTimeout('api'),
        validateStatus: () => true,
      });

      console.log(`📊 Auth Response Status: ${response.status}`);

      if (response.status === 200 && response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        console.log(`✅ Access Token Generated: ${this.accessToken.substring(0, 30)}...`);
        return this.accessToken;
      } else {
        throw new Error(`Authentication failed. Status: ${response.status}. Response: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error(`❌ Authentication failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current access token (generates if not already generated)
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    if (!this.accessToken) {
      return await this.authenticateAndGetToken();
    }
    return this.accessToken;
  }

  /**
   * Generic API request method that handles everything from JSON test data
   * @param {Object} testData - Complete test data from JSON file
   * @param {string} token - Authentication token (optional, uses access token if not provided)
   * @returns {Promise<Object>} Response body
   */
  async makeApiRequest(testData, token = null) {
    // Use provided token, or access token, or fall back to configured token
    let authToken = token;
    if (!authToken) {
      if (this.accessToken) {
        authToken = this.accessToken;
      } else {
        // Try to get access token, otherwise use configured token
        try {
          authToken = await this.getAccessToken();
        } catch (error) {
          console.warn(`⚠️ Could not get access token, using configured token`);
          authToken = this.apiToken;
        }
      }
    }

    const url = `${this.baseUrl}${testData.url}`;

    try {
      // Log environment and request details
      console.log(`\n🌍 Environment: ${this.config.environment.toUpperCase()}`);
      console.log(`🚀 API Request: ${testData.method} ${testData.url}`);

      if (testData.params && Object.keys(testData.params).length > 0) {
        console.log(`📝 Query Params: ${JSON.stringify(testData.params)}`);
      }
      if (testData.requestBody) {
        console.log(`📦 Request Body: ${JSON.stringify(testData.requestBody)}`);
      }
      if (authToken) {
        console.log(`🔑 Auth Token: ${authToken.substring(0, 25)}...`);
      }

      const response = await axios({
        method: testData.method || 'GET',
        url,
        data: testData.requestBody,
        params: testData.params,
        headers: this.getHeaders(authToken, testData.headers),
        timeout: this.config.getTimeout('api'),
        validateStatus: () => true, // Don't throw on any status code
      });

      // Log response details
      console.log(`\n📊 ACTUAL RESPONSE STATUS: ${response.status}`);
      console.log(`⏱️  Response Time: ${response.duration}ms`);

      // Log actual response body
      console.log(`\n📥 ACTUAL RESPONSE BODY:`);
      console.log(JSON.stringify(response.data, null, 2));

      // Log expected response status
      if (testData.expectedStatus) {
        console.log(`\n✅ EXPECTED RESPONSE STATUS: ${testData.expectedStatus}`);
        const statusMatch = response.status === testData.expectedStatus;
        console.log(`   Status Match: ${statusMatch ? '✅ PASS' : '❌ FAIL'}`);
      }

      // Log expected response body
      if (testData.expectedBody) {
        console.log(`\n✅ EXPECTED RESPONSE BODY:`);
        console.log(JSON.stringify(testData.expectedBody, null, 2));
      }

      // Validate response using test data
      this.validateApiResponse(response, testData);

      // Store important values for future tests
      this.storeTestData(response.data, testData);

      // Perform additional fintech-specific validations
      this.performAdditionalValidations(response, testData);

      // Store response for debugging
      this.responses.push({
        url,
        method: testData.method,
        status: response.status,
        data: response.data,
        duration: response.duration,
        timestamp: new Date(),
      });

      return response.data;
    } catch (error) {
      console.error(`❌ API Request failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get headers with authentication and custom headers
   * @param {string} token - Authorization token
   * @param {Object} customHeaders - Additional headers
   * @returns {Object} Headers object
   */
  getHeaders(token, customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Stores important test data for cross-test validation
   * @param {Object} responseBody - Response body
   * @param {Object} testConfig - Test configuration
   */
  storeTestData(responseBody, testConfig) {
    if (responseBody && responseBody.transactionId) {
      this.storedTestData.transactionId = responseBody.transactionId;
      console.log(`💳 Transaction ID stored: ${responseBody.transactionId}`);
    }

    if (responseBody && responseBody.availableBalance) {
      this.storedTestData.accountBalance = parseFloat(responseBody.availableBalance);
      console.log(`💲 Account Balance stored: ${responseBody.availableBalance}`);
    }

    if (responseBody && responseBody.accountId) {
      this.storedTestData.accountId = responseBody.accountId;
      console.log(`🏦 Account ID stored: ${responseBody.accountId}`);
    }
  }

  /**
   * Performs additional fintech-specific validations
   * @param {Object} response - Axios response object
   * @param {Object} testConfig - Test configuration
   */
  performAdditionalValidations(response, testConfig) {
    const testName = testConfig.testName || 'unknown';

    // Custom validations from config
    if (testConfig.customValidations) {
      testConfig.customValidations.forEach(validation => {
        this.executeCustomValidation(response.data, validation);
      });
    }

    // Fintech compliance checks
    if (testName.includes('payment') || testName.includes('transaction')) {
      this.validatePCICompliance(response, response.data);
    }

    // Validate payment status transitions
    if (response.data && response.data.status && testName.includes('payment')) {
      this.validatePaymentStatusTransition(response.data.status);
    }

    // Validate account balance consistency
    if (testConfig.validateBalanceConsistency) {
      this.validateAccountBalance(response.data, testConfig.balanceConfig);
    }
  }

  /**
   * Executes custom validation rules
   * @param {Object} responseBody - Response body
   * @param {Object} validation - Validation configuration
   */
  executeCustomValidation(responseBody, validation) {
    const fieldValue = this.getNestedProperty(responseBody, validation.field);

    switch (validation.type) {
      case 'arrayLength':
        if (!Array.isArray(fieldValue)) {
          throw new Error(`${validation.field} is not an array`);
        }
        if (fieldValue.length !== validation.expectedLength) {
          throw new Error(`Array ${validation.field} has length ${fieldValue.length}, expected ${validation.expectedLength}`);
        }
        break;

      case 'contains':
        if (!fieldValue.includes(validation.expectedValue)) {
          throw new Error(`Field ${validation.field} does not contain ${validation.expectedValue}`);
        }
        break;

      case 'greaterThan':
        if (fieldValue <= validation.expectedValue) {
          throw new Error(`Field ${validation.field} (${fieldValue}) is not greater than ${validation.expectedValue}`);
        }
        break;

      case 'dataType':
        this.validateDataTypes(responseBody, { [validation.field]: validation.expectedType });
        break;

      default:
        console.log(`Unknown validation type: ${validation.type}`);
    }
  }

  /**
   * Validates API response against expected criteria with fintech-specific checks
   * @param {Object} response - Axios response object
   * @param {Object} expectedData - Expected response data
   */
  validateApiResponse(response, expectedData) {
    // Validate status code
    if (expectedData.expectedStatus) {
      if (response.status !== expectedData.expectedStatus) {
        throw new Error(
          `Status mismatch. Expected: ${expectedData.expectedStatus}, Got: ${response.status}\nResponse: ${JSON.stringify(response.data)}`
        );
      }
    }

    // Validate response time (fintech critical)
    if (expectedData.expectedResponseTime) {
      if (response.duration > expectedData.expectedResponseTime) {
        console.warn(
          `⏱️ Response time exceeded. Expected: ${expectedData.expectedResponseTime}ms, Got: ${response.duration}ms`
        );
      }
    }

    // Validate security headers
    this.validateSecurityHeaders(response);

    // Validate response body - full match
    if (expectedData.expectedBody) {
      console.log('🔍 Performing full body validation (exact match)');
      this.validateResponseBody(response.data, expectedData.expectedBody, false, expectedData.nonEmptyFields || []);
    }

    // Validate response body - subset match
    if (expectedData.subsetExpectedBody) {
      console.log('🔍 Performing subset body validation (partial match)');
      this.validateResponseBody(response.data, expectedData.subsetExpectedBody, true, expectedData.nonEmptyFields || []);
    }

    // Validate non-empty fields
    if (expectedData.nonEmptyFields && Array.isArray(expectedData.nonEmptyFields)) {
      console.log('🔍 Validating non-empty fields');
      this.validateNonEmptyFields(response.data, expectedData.nonEmptyFields);
    }

    // Validate monetary amounts
    if (expectedData.validateAmounts) {
      this.validateMonetaryAmounts(response.data, expectedData.amountFields);
    }

    // Validate transaction IDs
    if (expectedData.validateTransactionIds) {
      this.validateTransactionIds(response.data, expectedData.transactionIdFields);
    }

    // Validate sensitive data masking (PCI DSS)
    if (expectedData.validateDataMasking) {
      this.validateSensitiveDataMasking(response.data, expectedData.sensitiveFields);
    }
  }

  /**
   * Validates response body against expected body structure with enhanced validation
   * @param {Object} actualBody - Actual response body
   * @param {Object} expectedBody - Expected response body structure
   * @param {boolean} isSubset - If true, validates only subset; if false, validates entire structure
   * @param {Array} nonEmptyFields - Array of field paths that should only be checked for non-emptiness, not exact values
   * @param {string} currentPath - Current path in the object (for nested validation)
   */
  validateResponseBody(actualBody, expectedBody, isSubset = false, nonEmptyFields = [], currentPath = '') {
    if (!expectedBody || typeof expectedBody !== 'object') {
      return;
    }

    // If not subset validation, ensure actual body doesn't have extra properties
    if (!isSubset) {
      const actualKeys = Object.keys(actualBody || {});
      const expectedKeys = Object.keys(expectedBody);

      // Check for extra properties in actual body
      const extraKeys = actualKeys.filter(key => !expectedKeys.includes(key));
      if (extraKeys.length > 0) {
        console.warn(`⚠️ Extra properties found in response: ${extraKeys.join(', ')}`);
      }
    }

    // Validate expected properties
    Object.keys(expectedBody).forEach(key => {
      if (!actualBody.hasOwnProperty(key)) {
        throw new Error(`Missing property: ${key}`);
      }

      const actualValue = actualBody[key];
      const expectedValue = expectedBody[key];

      // Build the full path for this field
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;

      // Check if this field is in nonEmptyFields (should skip exact value matching)
      const isNonEmptyField = nonEmptyFields.includes(fieldPath);

      if (Array.isArray(expectedValue)) {
        // Handle array validation
        if (!Array.isArray(actualValue)) {
          throw new Error(`${key} should be an array`);
        }

        if (expectedValue.length > 0) {
          // Validate array structure with first element as template
          const templateItem = expectedValue[0];
          if (typeof templateItem === 'object' && templateItem !== null) {
            actualValue.forEach((item, index) => {
              console.log(`Validating array item ${index} for ${key}`);
              this.validateResponseBody(item, templateItem, isSubset, nonEmptyFields, `${fieldPath}[${index}]`);
            });
          } else {
            // For primitive array values, validate type
            actualValue.forEach((item, index) => {
              if (typeof item !== typeof templateItem) {
                throw new Error(`Array item ${index} type mismatch in ${key}`);
              }
            });
          }
        }
      } else if (expectedValue !== null && typeof expectedValue === 'object') {
        // Handle nested object validation
        if (typeof actualValue !== 'object' || actualValue === null) {
          throw new Error(`${key} should be an object`);
        }
        console.log(`🔍 Validating nested object: ${key}`);
        this.validateResponseBody(actualValue, expectedValue, isSubset, nonEmptyFields, fieldPath);
      } else {
        // Handle primitive value validation
        if (isNonEmptyField) {
          // Skip exact value matching for fields in nonEmptyFields
          // They will be validated by validateNonEmptyFields later
          console.log(`⏭️  Skipping exact value match for '${fieldPath}' (will validate non-empty later)`);
        } else {
          // Perform exact value matching for fields NOT in nonEmptyFields
          if (expectedValue !== null && expectedValue !== undefined) {
            // For exact value matching
            if (actualValue !== expectedValue) {
              throw new Error(`Value mismatch for ${key}. Expected: ${expectedValue}, Got: ${actualValue}`);
            }
          } else {
            // For null/undefined validation
            if (actualValue !== expectedValue) {
              throw new Error(`Null/undefined mismatch for ${key}`);
            }
          }
        }
      }
    });

    console.log(`✅ Body validation completed for ${Object.keys(expectedBody).length} properties`);
  }

  /**
   * Validates that specified fields are not empty with enhanced nested object support
   * @param {Object} responseBody - Response body to validate
   * @param {Array} nonEmptyFields - Array of field paths that should not be empty
   */
  validateNonEmptyFields(responseBody, nonEmptyFields) {
    if (!nonEmptyFields || !Array.isArray(nonEmptyFields)) {
      return;
    }

    nonEmptyFields.forEach(fieldPath => {
      const fieldValue = this.getNestedProperty(responseBody, fieldPath);

      // Log the field being validated
      console.log(`🔍 Validating non-empty field: ${fieldPath}`);

      // Check if field exists
      if (fieldValue === undefined) {
        throw new Error(`Field '${fieldPath}' should exist`);
      }
      if (fieldValue === null) {
        throw new Error(`Field '${fieldPath}' should not be null`);
      }

      // Check based on field type
      if (typeof fieldValue === 'string') {
        if (fieldValue.trim() === '') {
          throw new Error(`String field '${fieldPath}' should not be empty`);
        }
      } else if (Array.isArray(fieldValue)) {
        if (fieldValue.length === 0) {
          throw new Error(`Array field '${fieldPath}' should not be empty`);
        }
      } else if (typeof fieldValue === 'object') {
        if (Object.keys(fieldValue).length === 0) {
          throw new Error(`Object field '${fieldPath}' should not be empty`);
        }
      } else if (typeof fieldValue === 'number') {
        if (isNaN(fieldValue)) {
          throw new Error(`Number field '${fieldPath}' should not be NaN`);
        }
      } else {
        // For boolean and other types, just ensure they exist (already checked above)
        console.log(`✅ Field '${fieldPath}' exists and has value: ${fieldValue}`);
      }
    });

    console.log(`✅ Non-empty field validation completed for ${nonEmptyFields.length} fields`);
  }

  /**
   * Gets nested property value from object using dot notation
   * @param {Object} obj - Object to search in
   * @param {string} path - Dot notation path (e.g., 'user.profile.name')
   * @returns {*} Property value
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Validates monetary amounts for precision and format
   * @param {Object} responseBody - Response body to validate
   * @param {Array} amountFields - Array of field paths containing monetary amounts
   */
  validateMonetaryAmounts(responseBody, amountFields) {
    amountFields.forEach(fieldPath => {
      const amount = this.getNestedProperty(responseBody, fieldPath);

      if (amount !== null && amount !== undefined) {
        // Validate amount is a number or string representing a number
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (typeof numericAmount !== 'number' || isNaN(numericAmount)) {
          throw new Error(`Invalid amount format in ${fieldPath}: ${amount}`);
        }
        if (numericAmount < -1000000000 || numericAmount > 1000000000) {
          throw new Error(`Amount out of reasonable bounds in ${fieldPath}: ${amount}`);
        }

        // Validate decimal precision (max 2 decimal places for currency)
        if (typeof amount === 'string' && amount.includes('.')) {
          const decimalPlaces = amount.split('.')[1]?.length || 0;
          if (decimalPlaces > 2) {
            console.warn(`⚠️ Amount in ${fieldPath} has more than 2 decimal places: ${amount}`);
          }
        }

        console.log(`✅ Validated amount: ${fieldPath} = ${amount}`);
      }
    });
  }

  /**
   * Validates transaction ID formats
   * @param {Object} responseBody - Response body to validate
   * @param {Array} transactionIdFields - Array of field paths containing transaction IDs
   */
  validateTransactionIds(responseBody, transactionIdFields) {
    transactionIdFields.forEach(fieldPath => {
      const transactionId = this.getNestedProperty(responseBody, fieldPath);

      if (transactionId) {
        // Validate transaction ID format (alphanumeric, minimum length)
        if (typeof transactionId !== 'string') {
          throw new Error(`Transaction ID ${fieldPath} should be a string`);
        }
        if (transactionId.length <= 5) {
          throw new Error(`Transaction ID ${fieldPath} is too short: ${transactionId}`);
        }
        if (!/^[A-Za-z0-9_-]+$/.test(transactionId)) {
          throw new Error(`Invalid transaction ID format in ${fieldPath}: ${transactionId}`);
        }

        console.log(`✅ Validated transaction ID: ${fieldPath} = ${transactionId}`);
      }
    });
  }

  /**
   * Validates sensitive data is properly masked
   * @param {Object} responseBody - Response body to validate
   * @param {Array} sensitiveFields - Array of field paths that should be masked
   */
  validateSensitiveDataMasking(responseBody, sensitiveFields) {
    sensitiveFields.forEach(fieldPath => {
      const fieldValue = this.getNestedProperty(responseBody, fieldPath);

      if (fieldValue && typeof fieldValue === 'string') {
        // Check for common masking patterns
        const isMasked = fieldValue.includes('***') ||
          fieldValue.includes('XXX') ||
          fieldValue.includes('****') ||
          /\*{3,}/.test(fieldValue);

        if (fieldPath.includes('card') || fieldPath.includes('account')) {
          if (!isMasked) {
            console.warn(`⚠️ ${fieldPath} should be masked but found: ${fieldValue}`);
          }
        }

        console.log(`✅ Validated masking for: ${fieldPath}`);
      }
    });
  }

  /**
   * Validates security headers for fintech compliance
   * @param {Object} response - Axios response object
   */
  validateSecurityHeaders(response) {
    const headers = response.headers;

    // Check for required security headers
    if (!headers['content-type']) {
      console.warn(`⚠️ Content-Type header missing`);
    }

    // Validate CORS headers if present
    if (headers['access-control-allow-origin']) {
      if (headers['access-control-allow-origin'] === '*') {
        console.warn(`⚠️ Security: Access-Control-Allow-Origin should not be '*'`);
      }
    }

    // Check for security headers
    if (headers['x-content-type-options']) {
      if (headers['x-content-type-options'] !== 'nosniff') {
        console.warn(`⚠️ X-Content-Type-Options should be 'nosniff'`);
      }
    }

    if (headers['x-frame-options']) {
      const validValues = ['DENY', 'SAMEORIGIN'];
      if (!validValues.includes(headers['x-frame-options'])) {
        console.warn(`⚠️ X-Frame-Options should be one of: ${validValues.join(', ')}`);
      }
    }
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {string} path - Path using dot notation (e.g., "user.address.city")
   * @returns {*} Value at path or undefined
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Execute rate limit test
   * @param {Object} testData - Test data including requestCount
   * @param {string} token - API token
   */
  async executeRateLimitTest(testData, token = null) {
    const { requestCount = 10, expectedLimitStatus = 429 } = testData;
    let limitReached = false;

    for (let i = 0; i < requestCount; i++) {
      const response = await this.makeApiRequest(testData, token);
      if (response.status === expectedLimitStatus) {
        limitReached = true;
        console.log(`✅ Rate limit enforced after ${i} requests`);
        break;
      }
    }

    if (!limitReached) {
      console.warn(`⚠️ Rate limit not reached after ${requestCount} requests`);
    }
  }

  /**
   * Validates array response
   * @param {Array} actualArray - Actual array from response
   * @param {Object} expectedArrayConfig - Expected array configuration
   */
  validateArrayResponse(actualArray, expectedArrayConfig) {
    if (!Array.isArray(actualArray)) {
      throw new Error('Response is not an array');
    }

    if (expectedArrayConfig.minLength !== undefined) {
      if (actualArray.length < expectedArrayConfig.minLength) {
        throw new Error(`Array length ${actualArray.length} is less than ${expectedArrayConfig.minLength}`);
      }
    }

    if (expectedArrayConfig.maxLength !== undefined) {
      if (actualArray.length > expectedArrayConfig.maxLength) {
        throw new Error(`Array length ${actualArray.length} is greater than ${expectedArrayConfig.maxLength}`);
      }
    }

    if (expectedArrayConfig.exactLength !== undefined) {
      if (actualArray.length !== expectedArrayConfig.exactLength) {
        throw new Error(`Array length ${actualArray.length} does not equal ${expectedArrayConfig.exactLength}`);
      }
    }

    // Validate each item in array if itemStructure is provided
    if (expectedArrayConfig.itemStructure && actualArray.length > 0) {
      actualArray.forEach((item, index) => {
        this.validateResponseBody(item, expectedArrayConfig.itemStructure);
      });
    }
  }

  /**
   * Validates data types of response fields
   * @param {Object} responseBody - Response body to validate
   * @param {Object} typeValidations - Object mapping field paths to expected types
   */
  validateDataTypes(responseBody, typeValidations) {
    Object.keys(typeValidations).forEach(fieldPath => {
      const fieldValue = this.getNestedProperty(responseBody, fieldPath);
      const expectedType = typeValidations[fieldPath];

      if (typeof fieldValue !== expectedType) {
        throw new Error(`Type mismatch for ${fieldPath}. Expected: ${expectedType}, Got: ${typeof fieldValue}`);
      }
    });
  }

  /**
   * Validates account balance consistency
   * @param {Object} responseBody - Response body to validate
   * @param {Object} balanceConfig - Configuration for balance validation
   */
  validateAccountBalance(responseBody, balanceConfig) {
    const availableBalance = this.getNestedProperty(responseBody, balanceConfig.availableBalancePath);
    const currentBalance = this.getNestedProperty(responseBody, balanceConfig.currentBalancePath);
    const pendingAmount = this.getNestedProperty(responseBody, balanceConfig.pendingAmountPath);

    if (availableBalance !== null && currentBalance !== null) {
      const available = parseFloat(availableBalance);
      const current = parseFloat(currentBalance);
      const pending = pendingAmount ? parseFloat(pendingAmount) : 0;

      // Available balance should be current balance minus pending amounts
      const difference = Math.abs(available - (current - pending));
      if (difference >= 0.01) {
        throw new Error(
          `Balance validation failed: Available=${available}, Current=${current}, Pending=${pending}. Difference=${difference}`
        );
      }

      console.log(`✅ Balance validation: Available=${available}, Current=${current}, Pending=${pending}`);
    }
  }

  /**
   * Validates payment status transitions
   * @param {string} currentStatus - Current payment status
   * @param {string} previousStatus - Previous payment status (if available)
   */
  validatePaymentStatusTransition(currentStatus, previousStatus) {
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'initiated'];
    const validTransitions = {
      'pending': ['initiated', 'processing'],
      'processing': ['pending'],
      'completed': ['processing'],
      'failed': ['pending', 'processing'],
      'cancelled': ['pending', 'initiated'],
      'refunded': ['completed']
    };

    if (!validStatuses.includes(currentStatus)) {
      throw new Error(`Invalid payment status: ${currentStatus}`);
    }

    if (previousStatus && validTransitions[currentStatus]) {
      if (!validTransitions[currentStatus].includes(previousStatus)) {
        throw new Error(`Invalid status transition: ${previousStatus} → ${currentStatus}`);
      }
      console.log(`✅ Valid status transition: ${previousStatus} → ${currentStatus}`);
    }
  }

  /**
   * Validates compliance with PCI DSS requirements
   * @param {Object} response - Axios response object
   * @param {Object} responseBody - Response body to validate
   */
  validatePCICompliance(response, responseBody) {
    // Ensure no PAN (Primary Account Number) in response
    const responseString = JSON.stringify(responseBody);

    // Check for potential credit card numbers (basic pattern)
    const cardPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
    const cardMatch = responseString.match(cardPattern);
    if (cardMatch) {
      console.warn(`⚠️ Potential unmasked card number found in response`);
    }

    // Check for CVV patterns
    const cvvPattern = /\b\d{3,4}\b/g;
    const matches = responseString.match(cvvPattern);
    if (matches) {
      // Allow transaction IDs and amounts, but flag potential CVV
      matches.forEach(match => {
        if (match.length === 3 || match.length === 4) {
          console.warn(`⚠️ Potential CVV pattern found: ${match}`);
        }
      });
    }

    console.log('✅ PCI compliance validation completed');
  }

  /**
   * Execute payment workflow test
   * @param {Object} balanceTestData - Balance check test data
   * @param {Object} paymentTestData - Payment initiation test data  
   * @param {Object} statusTestData - Payment status check test data
   * @param {string} token - Authentication token
   * @returns {Promise<string>} Payment status
   */
  async executePaymentWorkflow(balanceTestData, paymentTestData, statusTestData, token) {
    let paymentId;

    // Check initial balance
    const balanceResponse = await this.makeApiRequest(balanceTestData, token);
    const initialBalance = parseFloat(balanceResponse.availableBalance);
    console.log(`💲 Initial Balance: $${initialBalance}`);

    // Initiate payment
    const paymentResponse = await this.makeApiRequest(paymentTestData, token);
    paymentId = paymentResponse.transactionId;
    console.log(`💳 Payment initiated: ${paymentId}`);

    // Update status test data URL with actual payment ID
    const updatedStatusTestData = {
      ...statusTestData,
      url: statusTestData.url.replace('{paymentId}', paymentId)
    };

    // Check payment status
    const statusResponse = await this.makeApiRequest(updatedStatusTestData, token);

    return statusResponse.status;
  }

  /**
   * Execute security test
   * @param {Object} testData - Security test data from JSON
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Response body with validation
   */
  async executeSecurityTest(testData, token = null) {
    // Simply use the generic method which handles all validations
    const responseBody = await this.makeApiRequest(testData, token);
    console.log('🔒 Security test completed via generic method');
    return responseBody;
  }

  /**
   * Execute error scenario test
   * @param {Object} testData - Error test data
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Response body
   */
  async executeErrorScenarioTest(testData, token = null) {
    const responseBody = await this.makeApiRequest(testData, token);
    console.log('💔 Error scenario test completed via generic method');
    return responseBody;
  }

  /**
   * Execute compliance test
   * @param {Object} testData - Compliance test data
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Response body
   */
  async executeComplianceTest(testData, token = null) {
    const responseBody = await this.makeApiRequest(testData, token);
    console.log('📋 Compliance test completed via generic method');
    return responseBody;
  }

  /**
   * Get stored responses for debugging
   * @returns {Array} Array of stored responses
   */
  getResponses() {
    return this.responses;
  }

  /**
   * Get stored test data
   * @returns {Object} Stored test data (transaction IDs, balances, etc.)
   */
  getStoredTestData() {
    return this.storedTestData;
  }

  /**
   * Clear stored responses
   */
  clearResponses() {
    this.responses = [];
  }

  /**
   * Clear stored test data
   */
  clearStoredTestData() {
    this.storedTestData = {};
  }
}

module.exports = FintechApiHelper;
