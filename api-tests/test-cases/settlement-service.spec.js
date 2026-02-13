/**
 * Settlement Service API Tests
 * Data-driven tests for settlement endpoints with financial compliance validations
 * All validation logic is centralized in FintechApiHelper and fixture JSON configuration
 */

const { test } = require('@playwright/test');
const FintechApiHelper = require('../utils/FintechApiHelper');
const fs = require('fs');
const path = require('path');

test.describe('💰 Settlement Service API Tests', () => {
  let apiHelper;
  let testData;
  const serviceName = 'settlement-service';

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

    console.log(`\n💰 Service: ${serviceName.toUpperCase()}`);
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

  // Separate test cases for each endpoint
  test('💰 Get Settlement Status', async () => {
    await apiHelper.makeApiRequest(testData['getSettlementStatus']);
  });

  test('📝 Initiate Settlement', async () => {
    await apiHelper.makeApiRequest(testData['initiateSettlement']);
  });

  test('📋 Get Settlement History', async () => {
    await apiHelper.makeApiRequest(testData['getSettlementHistory']);
  });

  test('💵 Get Payout Details', async () => {
    await apiHelper.makeApiRequest(testData['getPayoutDetails']);
  });

  test('🏦 Validate Bank Account', async () => {
    await apiHelper.makeApiRequest(testData['validateBankAccount']);
  });

  test('✅ Process Settlement', async () => {
    await apiHelper.makeApiRequest(testData['processSettlement']);
  });
});
