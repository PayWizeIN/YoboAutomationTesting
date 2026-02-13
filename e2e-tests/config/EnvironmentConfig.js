/**
 * E2E/UI Environment Configuration
 * Manages UI-specific URLs, credentials, and configurations
 * This file contains ONLY UI/E2E-related configurations
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
   * Get UI base URL for current environment
   * @returns {string} UI base URL
   */
  getUiBaseUrl() {
    if (this.environment === 'staging') {
      return process.env.UI_STAGING_BASE_URL || 'https://www.paywize.dev';
    }
    return process.env.UI_DEV_BASE_URL || 'https://dev.yobo.com';
  }

  /**
   * Get user credentials for login
   * @returns {Object} Username and password
   */
  getCredentials() {
    if (this.environment === 'staging') {
      return {
        username: process.env.STAGING_USERNAME,
        password: process.env.STAGING_PASSWORD,
      };
    }
    return {
      username: process.env.DEV_USERNAME,
      password: process.env.DEV_PASSWORD,
    };
  }

  /**
   * Get timeout configuration for UI operations
   * @param {string} type - Timeout type: 'default', 'navigation', or 'element'
   * @returns {number} Timeout in milliseconds
   */
  getTimeout(type = 'default') {
    const timeouts = {
      default: parseInt(process.env.DEFAULT_TIMEOUT || 30000),
      navigation: parseInt(process.env.NAVIGATION_TIMEOUT || 30000),
      element: parseInt(process.env.ELEMENT_TIMEOUT || 10000),
    };
    return timeouts[type] || timeouts.default;
  }

  /**
   * Get environment name
   * @returns {string} Current environment ('dev' or 'staging')
   */
  getEnvironment() {
    return this.environment;
  }
}

module.exports = EnvironmentConfig;
