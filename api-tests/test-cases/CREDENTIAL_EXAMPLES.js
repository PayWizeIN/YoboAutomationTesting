/**
 * Example: How to use different user credentials in test cases
 * This demonstrates the flexible credential passing approach
 */

const { test } = require('@playwright/test');
const FintechApiHelper = require('../utils/FintechApiHelper');
const EnvironmentConfig = require('../config/EnvironmentConfig');

// ========================================
// EXAMPLE 1: Super Admin User Test
// ========================================
test.describe('Super Admin Tests', () => {
    let apiHelper;
    let config;

    test.beforeAll(async () => {
        const environment = process.env.TEST_ENV || 'dev';
        apiHelper = new FintechApiHelper(environment);
        config = new EnvironmentConfig(environment);

        // Get super admin credentials from config
        const superAdminCredentials = config.getAuthCredentials();

        // Authenticate with super admin credentials
        await apiHelper.authenticateAndGetToken(superAdminCredentials);
        console.log('✅ Authenticated as Super Admin');
    });

    test('Super admin can access admin endpoint', async () => {
        // Your test logic here
        // All API calls will use super admin token
    });
});

// ========================================
// EXAMPLE 2: End User Test
// ========================================
test.describe('End User Tests', () => {
    let apiHelper;

    test.beforeAll(async () => {
        const environment = process.env.TEST_ENV || 'dev';
        apiHelper = new FintechApiHelper(environment);

        // Define end user credentials directly in test
        const endUserCredentials = {
            phone: process.env.ENDUSER_PHONE || '+919876543210',
            password: process.env.ENDUSER_PASSWORD || 'EndUserPassword123',
            otp: process.env.ENDUSER_OTP || '123456',
        };

        // Authenticate with end user credentials
        await apiHelper.authenticateAndGetToken(endUserCredentials);
        console.log('✅ Authenticated as End User');
    });

    test('End user can access user endpoint', async () => {
        // Your test logic here
        // All API calls will use end user token
    });
});

// ========================================
// EXAMPLE 3: Multiple Users in Same Test Suite
// ========================================
test.describe('Multi-User Tests', () => {
    let apiHelper;
    let config;

    test.beforeAll(async () => {
        const environment = process.env.TEST_ENV || 'dev';
        apiHelper = new FintechApiHelper(environment);
        config = new EnvironmentConfig(environment);
    });

    test('Test with super admin', async () => {
        // Get super admin credentials
        const superAdminCreds = config.getAuthCredentials();

        // Authenticate as super admin
        await apiHelper.authenticateAndGetToken(superAdminCreds);

        // Make API calls as super admin
        // ...
    });

    test('Test with end user', async () => {
        // Define end user credentials
        const endUserCreds = {
            phone: '+919876543210',
            password: 'EndUserPassword',
            otp: '123456',
        };

        // Authenticate as end user
        await apiHelper.authenticateAndGetToken(endUserCreds);

        // Make API calls as end user
        // ...
    });
});

// ========================================
// EXAMPLE 4: Using Custom Credentials
// ========================================
test.describe('Custom Credentials Test', () => {
    let apiHelper;

    test.beforeAll(async () => {
        const environment = process.env.TEST_ENV || 'dev';
        apiHelper = new FintechApiHelper(environment);
    });

    test('Test with specific user credentials', async () => {
        // Define custom credentials for this specific test
        const customCredentials = {
            phone: '+911234567890',
            password: 'CustomPassword123',
            otp: '654321',
        };

        // Authenticate with custom credentials
        await apiHelper.authenticateAndGetToken(customCredentials);

        // Make API calls with this user's token
        // ...
    });
});

// ========================================
// EXAMPLE 5: Helper Function for Different Users
// ========================================

// Helper function to get credentials for different user types
function getUserCredentials(userType) {
    const credentials = {
        superadmin: {
            phone: process.env.SUPERADMIN_PHONE || '+919648181964',
            password: process.env.SUPERADMIN_PASSWORD || 'Superadmin@paywize@1230',
            otp: process.env.SUPERADMIN_OTP || '123456',
        },
        admin: {
            phone: process.env.ADMIN_PHONE || '+919111111111',
            password: process.env.ADMIN_PASSWORD || 'AdminPassword123',
            otp: process.env.ADMIN_OTP || '123456',
        },
        enduser: {
            phone: process.env.ENDUSER_PHONE || '+919876543210',
            password: process.env.ENDUSER_PASSWORD || 'EndUserPassword123',
            otp: process.env.ENDUSER_OTP || '123456',
        },
    };

    return credentials[userType] || credentials.superadmin;
}

test.describe('Using Helper Function', () => {
    let apiHelper;

    test.beforeAll(async () => {
        const environment = process.env.TEST_ENV || 'dev';
        apiHelper = new FintechApiHelper(environment);
    });

    test('Test with super admin using helper', async () => {
        const credentials = getUserCredentials('superadmin');
        await apiHelper.authenticateAndGetToken(credentials);
        // Test logic...
    });

    test('Test with end user using helper', async () => {
        const credentials = getUserCredentials('enduser');
        await apiHelper.authenticateAndGetToken(credentials);
        // Test logic...
    });
});
