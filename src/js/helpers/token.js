/**
 * @summary Static CSRF token manager for reading and updating security tokens.
 */
class Token {
  static #selector = "input[name*='token_common']";

  static getSelector () {
    return this.#selector;
  }

  static setSelector (selector) {
    this.#selector = selector;
  }

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableMethods = new Map([
      ['getSelector()', 'Returns the current CSS selector used to find the token input.'],
      ['setSelector(selector)', 'Sets the CSS selector for the token input. Default: `input[name*=\'token_common\']`.'],
      ['get()', 'Returns the security token value from the page. Returns `null` if not found.'],
      ['update(token)', 'Updates the security token value on the page.']
    ]);
    console.info('%cToken', 'font-size: 20px; font-weight: bold; color: red');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Gets the security token value from the page.
   * @returns {string|null} Token value or null if not found.
   */
  static get () {
    const tokenInput = document.querySelector(this.#selector);
    
    return tokenInput?.value || null;
  }

  /**
   * Updates the security token value on the page.
   * @param {string} token - New token value.
   */
  static update (token) {
    const tokenInput = document.querySelector(this.#selector);
    if (tokenInput) {
      tokenInput.value = token;
    } else {
      console.warn('[Sadrazam|Token] Input element not found.');
    }
  }
}

export default Token;