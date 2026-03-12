/**
 * Payment Service API Tests - Sequential with Data Sharing
 * Tests run in sequence to allow sharing response data between tests
 * Example: POST creates payment → GET uses payment ID → PUT updates it → DELETE removes it
 */

const { test, expect } = require('@playwright/test');
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

  // Validate send otp functionality with valid data
  //YOBO-T4
  test('1️⃣Validate send otp functionality with valid data', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 1: Validate send otp functionality with valid data`);
    console.log(`${'='.repeat(80)}`);

    const mobileNumber = apiHelper.generateMobileNumber();
    const requestPayload = JSON.parse(
      JSON.stringify(testData['Validate send otp functionality with valid data'])
    );

    // Step 3: Update phone field
    requestPayload.requestBody.identifier.phone = mobileNumber;
    requestPayload.expectedBody.data.phone = "+91" + mobileNumber;
    console.log(`📱 Using Mobile Number: ${mobileNumber}`);
    const response = await apiHelper.makeApiRequest(requestPayload, "");

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

  test('Validate Send OTP with Invalid phone number', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 2: Validate Send OTP with Invalid phone number`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Validate Send OTP with Invalid phone number'], "");

    console.log(`${'='.repeat(80)}\n`);
  });

  test('Verify error when phone number is missing', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 4: Verify error when phone number is missing`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify error when phone number is missing'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify error when countryCode missing', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 5: Verify error when countryCode missing`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify error when countryCode missing'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify error when channel missing', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 6: Verify error when channel missing`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify error when channel missing'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  //   test('Verify OTP rate limiting', async () => {
  //   console.log(`\n${'='.repeat(80)}`);
  //   console.log(`🧪 TEST 7: Verify OTP rate limiting`);
  //   console.log(`${'='.repeat(80)}`);

  //   const testConfig = testData['Verify OTP rate limiting'];
  //   const maxAttempts = testConfig.maxAttempts;

  //   let lastResponse;

  //   for (let i = 1; i <= maxAttempts; i++) {
  //     console.log(`🔁 Attempt ${i}`);

  //     lastResponse = await apiHelper.makeApiRequest(testConfig, "");

  //     console.log(`Status Code: ${lastResponse.status}`);

  //     // If rate limit hit, break early
  //     if (lastResponse.status === 429) {
  //       console.log("✅ Rate limit triggered");
  //       break;
  //     }
  //   }

  //   expect(lastResponse.status).toBe(429);

  //   console.log(`${'='.repeat(80)}\n`);
  // });
  test('Verify phone number minimum length must be 10 digits', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 8: Verify phone number minimum length must be 10 digits`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify phone number minimum length must be 10 digits'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify phone number maximum length restricted to 10 digits', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 9: Verify phone number maximum length restricted to 10 digits`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify phone number maximum length restricted to 10 digits'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify phone number should start with digits between 6-9', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 10: Verify phone number should start with digits between 6-9`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify phone number should start with digits between 6-9'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify phone field should not accept country code prefix', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 11: Verify phone field should not accept country code prefix`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify phone field should not accept country code prefix'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  // test('Verify API returns 400 when body is empty {}', async () => {
  //   console.log(`\n${'='.repeat(80)}`);
  //   console.log(`🧪 TEST 12: Verify API returns 400 when body is empty {}`);
  //   console.log(`${'='.repeat(80)}`);

  //   const response = await apiHelper.makeApiRequest(testData['Verify API returns 400 when body is empty {}'], "");
  //   console.log(`response: ${JSON.stringify(response)}`);
  //   console.log(`${'='.repeat(80)}\n`);
  //   //
  //   expect(response.status).toBe(400);
  // expect(response.body.success).toBe(false);
  // expect(response.body.error.category).toBe('VALIDATION_ERROR');

  // console.log(`${'='.repeat(80)}\n`);
  // //
  // });
  // test('Verify API handles completely missing payload', async () => {
  //   console.log(`\n${'='.repeat(80)}`);
  //   console.log(`🧪 TEST 13: Verify API handles completely missing payload`);
  //   console.log(`${'='.repeat(80)}`);

  //   const response = await apiHelper.makeApiRequest(testData['Verify API handles completely missing payload'], "");
  //   console.log(`response: ${JSON.stringify(response)}`);
  //   console.log(`${'='.repeat(80)}\n`);
  // });
  test('Verify API rejects GET method', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 12: Verify API rejects GET method`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify API rejects GET method'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify API rejects PUT method', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 13: Verify API rejects PUT method`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify API rejects PUT method'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify API rejects DELETE method', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 14: Verify API rejects DELETE method`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify API rejects DELETE method'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify API rejects PATCH method', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 15: Verify API rejects PATCH method`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify API rejects PATCH method'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify phone trims leading/trailing spaces', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 16: Verify phone trims leading/trailing spaces`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify phone trims leading/trailing spaces'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify countryCode trims whitespace', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 17: Verify countryCode trims whitespace`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify countryCode trims whitespace'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify channel is case-sensitive', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 18: Verify channel is case-sensitive`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify channel is case-sensitive'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify platform is case-sensitive', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 19: Verify platform is case-sensitive`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify platform is case-sensitive'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify SQL injection attempt in phone is rejected', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 20: Verify SQL injection attempt in phone is rejected`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify SQL injection attempt in phone is rejected'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify script injection in phone rejected', async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 21: Verify script injection in phone rejected`);
    console.log(`${'='.repeat(80)}`);

    const response = await apiHelper.makeApiRequest(testData['Verify script injection in phone rejected'], "");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify phase always equals UNIFIED_OTP_SEND for PHONE_OTP', async () => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 22: Verify phase always equals UNIFIED_OTP_SEND for PHONE_OTP`);
    console.log(`${'='.repeat(80)}`);

    const mobileNumber = apiHelper.generateMobileNumber();

    const requestPayload = JSON.parse(
      JSON.stringify(testData['Verify phase always equals UNIFIED_OTP_SEND for PHONE_OTP'])
    );

    requestPayload.requestBody.identifier.phone = mobileNumber;
    requestPayload.expectedBody.data.phone = "+91" + mobileNumber;
    console.log(`📱 Using Mobile Number: ${mobileNumber}`);

    const response = await apiHelper.makeApiRequest(requestPayload, "");

    expect(response.success).toBe(true);
    expect(response.data.phase).toBe("UNIFIED_OTP_SEND");

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify data.phone always includes +91 prefix', async () => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 23: Verify data.phone always includes +91 prefix`);
    console.log(`${'='.repeat(80)}`);

    const mobileNumber = apiHelper.generateMobileNumber();

    const requestPayload = JSON.parse(
      JSON.stringify(testData['Verify data.phone always includes +91 prefix'])
    );

    requestPayload.requestBody.identifier.phone = mobileNumber;
    requestPayload.expectedBody.data.phone = "+91" + mobileNumber;
    console.log(`📱 Using Mobile Number: ${mobileNumber}`);

    const response = await apiHelper.makeApiRequest(requestPayload, "");

    expect(response.data.phone).toMatch(/^\+91\d{10}$/);
    expect(response.data.phone).toBe(`+91${mobileNumber}`);

    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify response never exposes raw OTP', async () => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 24: Verify response never exposes raw OTP`);
    console.log(`${'='.repeat(80)}`);

    const mobileNumber = apiHelper.generateMobileNumber();

    const requestPayload = JSON.parse(
      JSON.stringify(testData['Verify response never exposes raw OTP'])
    );

    requestPayload.requestBody.identifier.phone = mobileNumber;
    requestPayload.expectedBody.data.phone = "+91" + mobileNumber;
    console.log(`📱 Using Mobile Number: ${mobileNumber}`);

    const response = await apiHelper.makeApiRequest(requestPayload, "");

    const responseString = JSON.stringify(response);

    expect(responseString.toLowerCase()).not.toContain('"otp"');
    expect(responseString.toLowerCase()).not.toContain('rawotp');
    expect(responseString.toLowerCase()).not.toContain('generatedotp');

    const otpPattern = /\b\d{6}\b/;
    expect(responseString).not.toMatch(otpPattern);

    console.log("✅ No raw OTP exposed in response");
    console.log(`${'='.repeat(80)}\n`);
  });
  test('Verify response never exposes password', async () => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 26: Verify response never exposes password`);
    console.log(`${'='.repeat(80)}`);

    const mobileNumber = apiHelper.generateMobileNumber();

    const requestPayload = JSON.parse(
      JSON.stringify(testData['Verify response never exposes password'])
    );


    requestPayload.requestBody.identifier.phone = mobileNumber;
    requestPayload.expectedBody.data.phone = "+91" + mobileNumber;
    console.log(`📱 Using Mobile Number: ${mobileNumber}`);

    const response = await apiHelper.makeApiRequest(requestPayload, "");

    expect(typeof response.data.userState.hasPassword).toBe('boolean');
    expect(typeof response.data.decision.hasPassword).toBe('boolean');

    const responseString = JSON.stringify(response).toLowerCase();

    expect(responseString).not.toContain('"password"');
    expect(responseString).not.toContain('"mpin"');

    console.log("✅ Password exposure validation passed");
    console.log(`${'='.repeat(80)}\n`);
  });



  //verify that the API correctly handles a valid OTP verification flow
  test('Verify OTP with valid otpSession & OTP', async () => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 01: Verify OTP with valid otpSession & OTP`);
    console.log(`${'='.repeat(80)}`);

    console.log("STEP 1: Send OTP");

    // Clone send OTP payload
    const sendOtpPayload = JSON.parse(
      JSON.stringify(testData['Validate send otp functionality with valid data'])
    );

    const mobileNumber = apiHelper.generateMobileNumber();

    sendOtpPayload.requestBody.identifier.phone = mobileNumber;
    sendOtpPayload.expectedBody.data.phone = "+91" + mobileNumber;

    const sendOtpResponse = await apiHelper.makeApiRequest(sendOtpPayload, "");

    const otpSession = sendOtpResponse?.data?.otpSession;

    console.log("Captured otpSession:", otpSession);

    console.log("STEP 2: Verify OTP");

    const verifyPayload = JSON.parse(
      JSON.stringify(testData['Verify OTP with valid otpSession & OTP'])
    );

    // Inject dynamic otpSession
    verifyPayload.requestBody.credential.otpSession = otpSession;

    // IMPORTANT: verificationToken is dynamic → remove from expectedBody
    delete verifyPayload.expectedBody.data.verificationToken;

    const verifyResponse = await apiHelper.makeApiRequest(verifyPayload, "");
    console.log(`${'='.repeat(80)}\n`);
    console.log(`${'='.repeat(80)}\n`);

  });
  test('Verify OTP with invalid otpSession & OTP', async () => {

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TEST 02: Verify OTP with invalid otpSession & OTP`);
    console.log(`${'='.repeat(80)}`);

    console.log("STEP 1: Send OTP");

    // Clone send OTP payload
    const sendOtpPayload = JSON.parse(
      JSON.stringify(testData['Validate send otp functionality with valid data'])
    );

    const mobileNumber = apiHelper.generateMobileNumber();

    sendOtpPayload.requestBody.identifier.phone = mobileNumber;
    sendOtpPayload.expectedBody.data.phone = "+91" + mobileNumber;

    const sendOtpResponse = await apiHelper.makeApiRequest(sendOtpPayload, "");

    const otpSession = sendOtpResponse?.data?.otpSession;

    console.log("Captured otpSession:", otpSession);

    console.log("STEP 2: Verify OTP");

    const verifyPayload = JSON.parse(
      JSON.stringify(testData['Verify OTP with invalid otpSession & OTP'])
    );

    // Inject dynamic otpSession + some invalid modification
    verifyPayload.requestBody.credential.otpSession = otpSession + "qwerty";
    verifyPayload.requestBody.credential.otp = "000000"; // invalid OTP

    // // Only delete verificationToken if data exists
    // if (verifyPayload.expectedBody.data) {
    //     delete verifyPayload.expectedBody.data.verificationToken;
    // }

    const verifyResponse = await apiHelper.makeApiRequest(verifyPayload, "");
    console.log(`${'='.repeat(80)}\n`);
    console.log(`${'='.repeat(80)}\n`);

  });
//   test('Verify OTP with expired otpSession', async () => {

//   console.log(`\n${'='.repeat(80)}`);
//   console.log(`🧪 TEST 03: Verify OTP with expired otpSession`);
//   console.log(`${'='.repeat(80)}`);

//   // STEP 1: Send OTP
//   const sendOtpPayload = JSON.parse(
//     JSON.stringify(testData['Validate send otp functionality with valid data'])
//   );

//   const mobileNumber = apiHelper.generateMobileNumber();
//   sendOtpPayload.requestBody.identifier.phone = mobileNumber;
//   sendOtpPayload.expectedBody.data.phone = "+91" + mobileNumber;

//   const sendOtpResponse = await apiHelper.makeApiRequest(sendOtpPayload, "");
//   const otpSession = sendOtpResponse?.data?.otpSession;

//   console.log("Captured otpSession:", otpSession);

//   // STEP 2: Wait for OTP to expire (simulate or real wait)
//   console.log("Waiting for OTP to expire...");
//   await new Promise(res => setTimeout(res, 310 * 1000)); // 310s > 300s expiry

//   // STEP 3: Verify expired OTP
//   const verifyPayload = JSON.parse(
//     JSON.stringify(testData['Verify OTP with expired otpSession'])
//   );

//   verifyPayload.requestBody.credential.otpSession = otpSession;

//   const verifyResponse = await apiHelper.makeApiRequest(verifyPayload, "");

//   console.log("Response for expired OTP:", verifyResponse);
//   console.log(`${'='.repeat(80)}\n`);
// });



});
