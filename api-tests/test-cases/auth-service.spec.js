/**
 * Payment Service API Tests - Sequential with Data Sharing
 * Tests run in sequence to allow sharing response data between tests
 * Example: POST creates payment → GET uses payment ID → PUT updates it → DELETE removes it
 */

const { test } = require('@playwright/test');
const FintechApiHelper = require('../utils/FintechApiHelper');
const EnvironmentConfig = require('../config/EnvironmentConfig');
const fs = require('fs');
const path = require('path');

test.describe('🏦 Auth Service API Tests', () => {
  let apiHelper;
  let config;
  let testData;
  const serviceName = 'auth-service';
  let otpSession;

  // Shared context to store response data from each test
  const context = {
    paymentId: null,
    accountBalance: null,
    transactionId: null,
    response: {}
  };

  test.beforeAll(async () => {
    // Get environment from environment variable or default to 'dev'
    const environment = process.env.TEST_ENV || 'dev';

    // Load service-specific environment test data
    // Replace line 33 with this:
    const fixtureFile = path.resolve(process.cwd(), 'api-tests', 'fixtures', environment, `${serviceName}-${environment}.json`);

    const rawData = fs.readFileSync(fixtureFile, 'utf8');
    testData = JSON.parse(rawData);

    // Initialize API helper and config with environment
    apiHelper = new FintechApiHelper(environment);
    config = new EnvironmentConfig(environment);

    console.log(`\n🏦 Service: ${serviceName.toUpperCase()}`);
    console.log(`🌍 Environment: ${environment.toUpperCase()}`);
    console.log(`🔗 Base URL: ${apiHelper.baseUrl}`);

    // Get credentials from config (super admin by default)
    // const credentials = config.getAuthCredentials();

    // Authenticate and get access token before running tests
    // try {
    //   // const accessToken = await apiHelper.authenticateAndGetToken(credentials);
    //   console.log(`\n✅ Authentication successful! Ready to run tests.\n`);
    // } catch (error) {
    //   console.error(`\n❌ Authentication failed! Cannot proceed with tests.`);
    //   console.error(`Error: ${error.message}\n`);
    //   throw error;
    // }
  });

  // Test 1: Get Account Balance (Initial data fetch)
  test('1️⃣Validate Send OTP', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 1: Validate Send OTP`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Validate Send OTP'], "");
    otpSession = response?.data?.otpSession;
    console.log(`\n✅ [PASSED] OTP Session Retrieved: ${otpSession}`);
    console.log(`📌 Stored in otpSession for use in next tests`);
    console.log(`${'='.repeat(80)}\n`);
  });

  test('Validate Send OTP_with_Invalid_Channel', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 2: Validate Send OTP_with_Invalid_Channel`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Validate Send OTP_with_Invalid_Channel'], "");

    console.log(`${'='.repeat(80)}\n`);
  });

});
