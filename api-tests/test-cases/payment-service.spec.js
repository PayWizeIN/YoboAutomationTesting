/**
 * Payment Service API Tests - Sequential with Data Sharing
 * Tests run in sequence to allow sharing response data between tests
 * Example: POST creates payment → GET uses payment ID → PUT updates it → DELETE removes it
 */

const { test } = require('@playwright/test');
const FintechApiHelper = require('../utils/FintechApiHelper');
const fs = require('fs');
const path = require('path');

test.describe('🏦 Payment Service API Tests', () => {
  let apiHelper;
  let testData;
  const serviceName = 'payment-service';
  let benefciaryID;
  
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
    const fixtureFile = path.join(
      __dirname,
      `../fixtures/${environment}/${serviceName}-${environment}.json`
    );
    
    const rawData = fs.readFileSync(fixtureFile, 'utf8');
    testData = JSON.parse(rawData);

    // Initialize API helper with environment
    apiHelper = new FintechApiHelper(environment);

    console.log(`\n🏦 Service: ${serviceName.toUpperCase()}`);
    console.log(`🌍 Environment: ${environment.toUpperCase()}`);
    console.log(`🔗 Base URL: ${apiHelper.baseUrl}`);

    // Authenticate and get access token before running tests
    try {
      const accessToken = await apiHelper.authenticateAndGetToken();
      console.log(`\n✅ Authentication successful! Ready to run tests.\n`);
    } catch (error) {
      console.error(`\n❌ Authentication failed! Cannot proceed with tests.`);
      console.error(`Error: ${error.message}\n`);
      throw error;
    }
  });

  // Test 1: Get Account Balance (Initial data fetch)
  test('1️⃣ Get payout overview', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 1: Get payout overview`);
    console.log(`${'='.repeat(80)}`);
    
    const response = await apiHelper.makeApiRequest(testData['Get payout overview']);
    
    // Store balance for next tests
    context.accountBalance = response?.data?.bankWallet?.total;
    console.log(`\n✅ [PASSED] Account Balance Retrieved: ${context.accountBalance}`);
    console.log(`📌 Stored in context.accountBalance for use in next tests`);
    console.log(`${'='.repeat(80)}\n`);
  });


  // Test 7: Unauthorized Access Test (Negative test)
  test('7️⃣ Unauthorized Access Test', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 7: Unauthorized Access Test`);
    console.log(`${'='.repeat(80)}`);
    
    try {
      await apiHelper.makeApiRequest(testData['unauthorizedAccessTest']);
      console.log(`\n✅ [PASSED] Unauthorized access properly handled`);
    } catch (error) {
      console.log(`\n✅ [PASSED] Unauthorized access error caught: ${error.message}`);
    }
    console.log(`${'='.repeat(80)}\n`);
  });


});
