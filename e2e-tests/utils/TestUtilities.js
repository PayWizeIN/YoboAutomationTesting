/**
 * Test Utilities Helper
 * Provides common utility functions for tests
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class TestUtilities {
  /**
   * Generate unique email
   * @param {string} prefix - Email prefix
   * @returns {string} Generated email
   */
  static generateEmail(prefix = 'test') {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}@yobo.com`;
  }

  /**
   * Generate unique transaction ID
   * @returns {string} Transaction ID
   */
  static generateTransactionId() {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Generate unique order ID
   * @returns {string} Order ID
   */
  static generateOrderId() {
    return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Generate UUID
   * @returns {string} UUID
   */
  static generateUUID() {
    return uuidv4();
  }

  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string} Random string
   */
  static generateRandomString(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
  }

  /**
   * Generate random number
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static generateRandomNumber(min = 1, max = 1000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random mobile number
   * @returns {string} Mobile number
   */
  static generateMobileNumber() {
    const prefix = '98';
    const number = this.generateRandomNumber(1000000000, 9999999999);
    return `+${prefix}${number}`;
  }

  /**
   * Format currency with 2 decimal places
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  static formatCurrency(amount) {
    return parseFloat(amount).toFixed(2);
  }

  /**
   * Generate hash of string
   * @param {string} text - Text to hash
   * @returns {string} Hash
   */
  static hashString(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Compare floating point numbers
   * @param {number} actual - Actual value
   * @param {number} expected - Expected value
   * @param {number} tolerance - Tolerance for comparison
   * @returns {boolean} True if values match within tolerance
   */
  static compareFloats(actual, expected, tolerance = 0.01) {
    return Math.abs(actual - expected) <= tolerance;
  }

  /**
   * Add days to date
   * @param {Date} date - Base date
   * @param {number} days - Days to add
   * @returns {Date} New date
   */
  static addDaysToDate(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Format date to ISO string
   * @param {Date} date - Date to format
   * @returns {string} ISO date string
   */
  static formatDateToISO(date) {
    return date.toISOString();
  }

  /**
   * Get current timestamp
   * @returns {string} ISO timestamp
   */
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  static async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum retries
   * @param {number} delay - Initial delay in ms
   * @returns {Promise} Result of function
   */
  static async retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.sleep(delay * Math.pow(2, i));
      }
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone to validate
   * @returns {boolean} True if valid
   */
  static validatePhone(phone) {
    const regex = /^\+?[0-9]{10,15}$/;
    return regex.test(phone);
  }

  /**
   * Parse JSON safely
   * @param {string} jsonString - JSON string
   * @returns {Object} Parsed object or null
   */
  static safeParseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }
}

module.exports = TestUtilities;
