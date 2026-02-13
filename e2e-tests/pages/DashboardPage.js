/**
 * Dashboard Page Object
 * Encapsulates dashboard page functionality
 */

const BasePage = require('../utils/BasePage');

class DashboardPage extends BasePage {
  // Page elements
  welcomeMessage = 'h1:has-text("Welcome")';
  accountBalance = '[data-test="account-balance"]';
  paymentButton = 'button:has-text("Send Money")';
  historyLink = 'a[href="/transactions"]';
  profileMenu = '[data-test="profile-menu"]';
  logoutButton = 'button:has-text("Logout")';

  constructor(page) {
    super(page);
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.goto('/dashboard');
    await this.waitForElement(this.welcomeMessage);
  }

  /**
   * Verify dashboard is loaded
   */
  async verifyPageLoaded() {
    await this.waitForElement(this.welcomeMessage);
    await this.waitForElement(this.accountBalance);
  }

  /**
   * Get account balance
   * @returns {Promise<string>} Account balance
   */
  async getAccountBalance() {
    return await this.getText(this.accountBalance);
  }

  /**
   * Click send money button
   */
  async clickSendMoney() {
    await this.click(this.paymentButton);
  }

  /**
   * Navigate to transaction history
   */
  async goToTransactionHistory() {
    await this.click(this.historyLink);
  }

  /**
   * Open profile menu
   */
  async openProfileMenu() {
    await this.click(this.profileMenu);
  }

  /**
   * Logout
   */
  async logout() {
    await this.openProfileMenu();
    await this.click(this.logoutButton);
    await this.waitForNavigation();
  }

  /**
   * Verify welcome message contains user name
   * @param {string} userName - Expected user name
   */
  async verifyWelcomeMessage(userName) {
    const message = await this.getText(this.welcomeMessage);
    if (!message.includes(userName)) {
      throw new Error(`Welcome message should contain ${userName}, got: ${message}`);
    }
  }
}

module.exports = DashboardPage;
