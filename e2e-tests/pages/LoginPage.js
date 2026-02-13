/**
 * Login Page Object
 * Encapsulates login page functionality
 */

const BasePage = require('../utils/BasePage');

class LoginPage extends BasePage {
  // Page elements
  emailInput = 'input[id="email"]';
  passwordInput = 'input[id="password"]';
  loginButton = 'button[type="submit"]';
  errorMessage = '.error-message';
  rememberMeCheckbox = 'input[type="checkbox"]';
  forgotPasswordLink = 'a[href="/forgot-password"]';

  constructor(page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLoginPage() {
    await this.goto('/login');
    await this.waitForElement(this.emailInput);
  }

  /**
   * Login with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async login(email, password) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
    await this.waitForNavigation();
  }

  /**
   * Login and remember
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async loginWithRemember(email, password) {
    await this.fill(this.emailInput, email);
    await this.fill(this.passwordInput, password);
    await this.click(this.rememberMeCheckbox);
    await this.click(this.loginButton);
    await this.waitForNavigation();
  }

  /**
   * Verify error message is displayed
   * @param {string} expectedMessage - Expected error message
   */
  async verifyErrorMessage(expectedMessage) {
    const message = await this.getText(this.errorMessage);
    if (!message.includes(expectedMessage)) {
      throw new Error(`Expected error: ${expectedMessage}, Got: ${message}`);
    }
  }

  /**
   * Check if error message is visible
   * @returns {Promise<boolean>} True if error is visible
   */
  async isErrorVisible() {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Click forgot password
   */
  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Verify login page is loaded
   */
  async verifyPageLoaded() {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }
}

module.exports = LoginPage;
