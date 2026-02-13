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
    // 1. Get environment and CLEAN IT (trim removes hidden \r characters)
    const rawEnv = process.env.TEST_ENV || 'dev';
    const environment = rawEnv.trim().toLowerCase(); 

    // 2. Build the path using path.join or path.resolve (resolve is better for absolute paths)
    const fixtureFile = path.resolve(
      process.cwd(), 
      'api-tests', 
      'fixtures', 
      environment, 
      `${serviceName}-${environment}.json`
    );

    // 3. Log the path so you can see it in Jenkins Console Output
    console.log(`[DEBUG] Workspace Root: ${process.cwd()}`);
    console.log(`[DEBUG] Attempting to load: ${fixtureFile}`);

    // 4. Safe Read
    try {
      const rawData = fs.readFileSync(fixtureFile, 'utf8');
      testData = JSON.parse(rawData);
    } catch (error) {
      console.error(`\n❌ Failed to load fixture file!`);
      console.error(`Checked Path: ${fixtureFile}`);
      throw error;
    }

    // Initialize API helper and config with sanitized environment
    // apiHelper = new FintechApiHelper(environment);
    // config = new EnvironmentConfig(environment);

    // console.log(`\n🏦 Service: ${serviceName.toUpperCase()}`);
    // console.log(`🌍 Environment: ${environment.toUpperCase()}`);
    // console.log(`🔗 Base URL: ${apiHelper.baseUrl}`);
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
