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
    // 1. CLEAN THE ENVIRONMENT VARIABLE
    // .trim() removes hidden Windows carriage returns (\r)
    // .toLowerCase() fixes any Case Sensitivity issues on Linux
    const rawEnv = (process.env.TEST_ENV || 'dev').trim().toLowerCase();

    // 2. BUILD THE PATH
    // process.cwd() ensures we start from /var/lib/jenkins/workspace/Yobo-API-Testing
    const fixtureFile = path.join(process.cwd(), 'api-tests', 'fixtures', rawEnv, `auth-service-${rawEnv}.json`);

    console.log(`[DEBUG] Final Resolved Path: "${fixtureFile}"`);

    // 3. CHECK IF FILE EXISTS BEFORE READING
    if (!fs.existsSync(fixtureFile)) {
      // This will print the exact folder content if it fails, so we can see the mistake
      const dirPath = path.join(process.cwd(), 'api-tests', 'fixtures', rawEnv);
      console.error(`❌ FOLDER CONTENT FOR ${dirPath}:`);
      try { console.error(fs.readdirSync(dirPath)); } catch (e) { console.error("Folder itself not found"); }
      throw new Error(`File Not Found at: ${fixtureFile}`);
    }

    const rawData = fs.readFileSync(fixtureFile, 'utf8');
    testData = JSON.parse(rawData);

    apiHelper = new FintechApiHelper(rawEnv);
    config = new EnvironmentConfig(rawEnv);
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
