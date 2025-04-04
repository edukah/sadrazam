/**
 * @summary Singleton spinner manager with reference counting.
 */
class Spinner {
  // --- Private Static Fields ---
  static #element = null;
  static #referenceCount = 0;

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['show({ type })', 'Shows the spinner. `type` can be \'main\' or \'helper\'. Default: `main`.'],
      ['hide()', 'Withdraws a spinner reference. Hides the spinner when reference count reaches 0.']
    ]);
    console.info('%cSpinner', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Shows the spinner or increments the reference count.
   * @param {object} [options] - Optional settings.
   * @param {string} [options.type='main'] - Spinner type ('main' or 'helper').
   */
  static show ({ type = 'main' } = {}) {
    this.#referenceCount++;

    if (!this.#element) {
      this.#element = document.createElement('div');
      this.#element.id = `spinner-${Date.now()}`;
      document.body.appendChild(this.#element);
    }
    
    // Always update the class to match the latest request
    this.#element.className = `spinner spinner--${type}`;
  }

  /**
   * Withdraws a spinner reference and removes it from the DOM when none remain.
   */
  static hide () {
    if (this.#referenceCount > 0) {
      this.#referenceCount--;
    }

    if (this.#referenceCount === 0 && this.#element) {
      this.#element.remove();
      this.#element = null;
    }
  }
}

export default Spinner;
