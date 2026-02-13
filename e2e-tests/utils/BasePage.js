/**
 * Base Page Object Model
 * Provides common functionality for all page objects
 */

class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 30000;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - URL to navigate to
   */
  async goto(url) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Click on an element
   * @param {string} selector - CSS selector
   */
  async click(selector) {
    await this.page.click(selector);
  }

  /**
   * Fill text input
   * @param {string} selector - CSS selector
   * @param {string} text - Text to fill
   */
  async fill(selector, text) {
    await this.page.fill(selector, text);
  }

  /**
   * Get text from element
   * @param {string} selector - CSS selector
   * @returns {Promise<string>} Text content
   */
  async getText(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Wait for element to be visible
   * @param {string} selector - CSS selector
   */
  async waitForElement(selector) {
    await this.page.waitForSelector(selector, { timeout: this.timeout });
  }

  /**
   * Check if element is visible
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} True if visible
   */
  async isVisible(selector) {
    try {
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} True if enabled
   */
  async isEnabled(selector) {
    try {
      return await this.page.isEnabled(selector);
    } catch {
      return false;
    }
  }

  /**
   * Get element value (for inputs)
   * @param {string} selector - CSS selector
   * @returns {Promise<string>} Value
   */
  async getValue(selector) {
    return await this.page.inputValue(selector);
  }

  /**
   * Select option from dropdown
   * @param {string} selector - CSS selector
   * @param {string} value - Value to select
   */
  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Wait for navigation
   * @returns {Promise} Navigation promise
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot
   * @param {string} filename - Filename for screenshot
   */
  async takeScreenshot(filename) {
    await this.page.screenshot({ path: `e2e-tests/reports/${filename}.png` });
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getUrl() {
    return this.page.url();
  }

  /**
   * Verify page title
   * @param {string} expectedTitle - Expected page title
   */
  async verifyTitle(expectedTitle) {
    const title = await this.page.title();
    if (title !== expectedTitle) {
      throw new Error(`Title mismatch. Expected: ${expectedTitle}, Got: ${title}`);
    }
  }

  /**
   * Verify page URL contains string
   * @param {string} expectedUrl - Expected URL substring
   */
  async verifyUrl(expectedUrl) {
    const url = await this.getUrl();
    if (!url.includes(expectedUrl)) {
      throw new Error(`URL mismatch. Expected to contain: ${expectedUrl}, Got: ${url}`);
    }
  }

  /**
   * Scroll to element
   * @param {string} selector - CSS selector
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Perform keyboard action
   * @param {string} key - Key to press
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  /**
   * Accept alert/dialog
   */
  async acceptAlert() {
    this.page.once('dialog', dialog => dialog.accept());
  }

  /**
   * Dismiss alert/dialog
   */
  async dismissAlert() {
    this.page.once('dialog', dialog => dialog.dismiss());
  }

  /**
   * Wait for specific time
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    await this.page.waitForTimeout(ms);
  }
}

module.exports = BasePage;
