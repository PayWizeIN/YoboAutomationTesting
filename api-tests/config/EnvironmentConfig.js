/**
 * API Environment Configuration
 * Manages API-specific URLs, tokens, and configurations
 * This file contains ONLY API-related configurations
 */

const fs = require('fs');
const path = require('path');

class EnvironmentConfig {
  constructor(environment = 'dev') {
    this.environment = environment;
    this.loadConfig();
  }

  loadConfig() {
    const envFile = path.join(__dirname, '../../.env');
    if (fs.existsSync(envFile)) {
      require('dotenv').config({ path: envFile });
    }
  }

  /**
   * Get API base URL for current environment
   * @returns {string} API base URL
   */
  getApiBaseUrl() {
    // Using the actual cashwize API endpoint
    return process.env.API_BASE_URL || 'https://dev.yobope.com/api/v1';
  }

  /**
   * Get authentication endpoint for token generation
   * @returns {string} Auth endpoint path
   */
  getAuthEndpoint() {
    return process.env.AUTH_ENDPOINT || 'api/v1/auth/test/verify-login';
  }

  /**
   * Get admin authentication credentials
   * @returns {Object} Phone, password, and OTP for login
   */
  getAdminAuthCredentials() {
    return {
      phone: process.env.AUTH_PHONE || '+919648181964',
      password: process.env.AUTH_PASSWORD || 'Superadmin@paywize@1230',
      otp: process.env.AUTH_OTP || '123456',
    };
  }

  /**
   * Get end-user authentication credentials
   * @returns {Object} Phone, password, and OTP for login
   */
  getEndUserAuthCredentials() {
    return {
      phone: process.env.END_USER_PHONE || '+919648181964',
      password: process.env.END_USER_PASSWORD || 'Superadmin@paywize@1230',
      otp: process.env.END_USER_OTP || '123456',
    };
  }

  /**
   * Validate authentication credentials format
   * @param {Object} credentials - Credentials object with phone, password, otp
   * @param {string} userType - Type of user for error messages
   * @throws {Error} If credentials are invalid
   */
  validateCredentials(credentials, userType = 'user') {
    // Validate phone number format (international format)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(credentials.phone)) {
      throw new Error(
        `Invalid phone number format for ${userType}: ${credentials.phone}. ` +
        `Expected format: +[country code][number] (e.g., +919648181964)`
      );
    }

    // Validate password (minimum 8 characters)
    if (credentials.password.length < 8) {
      throw new Error(
        `Invalid password for ${userType}: Password must be at least 8 characters long`
      );
    }

    // Validate OTP (6 digits)
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(credentials.otp)) {
      throw new Error(
        `Invalid OTP format for ${userType}: ${credentials.otp}. Must be exactly 6 digits.`
      );
    }

    return true;
  }

  /**
   * Get all available user types
   * @returns {Array<string>} List of supported user types
   */
  getAvailableUserTypes() {
    return ['admin', 'enduser'];
  }

  /**
   * Check if credentials exist for a specific user type
   * @param {string} userType - Type of user to check
   * @returns {boolean} True if credentials exist
   */
  hasCredentials(userType = 'admin') {
    try {
      this.getAuthCredentials(userType);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get API authentication token (static fallback if available)
   * @returns {string} Bearer token for API requests
   */
  getApiToken() {
    if (this.environment === 'uat') {
      return process.env.UAT_API_TOKEN || '';
    }
    return process.env.DEV_API_TOKEN || '';
  }

  /**
   * Get timeout configuration for API requests
   * @param {string} type - Timeout type: 'default' or 'api'
   * @returns {number} Timeout in milliseconds
   */
  getTimeout(type = 'api') {
    const timeouts = {
      default: parseInt(process.env.DEFAULT_TIMEOUT || 30000),
      api: parseInt(process.env.API_TIMEOUT || 15000),
    };
    return timeouts[type] || timeouts.default;
  }

  /**
   * Get environment name
   * @returns {string} Current environment ('dev' or 'uat')
   */
  getEnvironment() {
    return this.environment;
  }
}

module.exports = EnvironmentConfig;
