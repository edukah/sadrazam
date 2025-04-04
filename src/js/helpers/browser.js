/**
 * @summary Page Visibility API manager for detecting tab focus changes.
 */
class Browser {
  // --- Private Static Fields ---
  static #hiddenProp = null;
  static #visibilityChangeEvent = null;
  static #isInitialized = false;
  static #listeners = new Set();

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['isVisible()', 'Checks if the page is currently visible. Returns `true` or `false`.'],
      ['onChange(callback)', 'Runs the callback whenever page visibility changes. Returns an `unsubscribe` function.']
    ]);
    console.info('%cBrowser', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * @private Initializes the class, detects the correct event/property names,
   * and attaches the main visibility listener to document once.
   */
  static #initialize () {
    if (this.#isInitialized || typeof document === 'undefined') return;

    if (typeof document.hidden !== 'undefined') { // Standard
      this.#hiddenProp = 'hidden';
      this.#visibilityChangeEvent = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') { // IE 10
      this.#hiddenProp = 'msHidden';
      this.#visibilityChangeEvent = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') { // Chrome < 33, Safari < 9.1
      this.#hiddenProp = 'webkitHidden';
      this.#visibilityChangeEvent = 'webkitvisibilitychange';
    }

    if (this.#visibilityChangeEvent) {
      document.addEventListener(this.#visibilityChangeEvent, this.#handleVisibilityChange);
    }
    
    this.#isInitialized = true;
  }

  /**
   * @private Notifies all registered listeners when visibility state changes.
   */
  static #handleVisibilityChange = () => {
    const isVisible = this.isVisible();
    this.#listeners.forEach(callback => {
      try {
        callback(isVisible);
      } catch (e) {
        console.error('Browser: onChange callback threw an error.', e);
      }
    });
  };

  /**
   * Checks if the page is currently visible.
   * @returns {boolean} True if the page is visible, false otherwise.
   */
  static isVisible () {
    this.#initialize(); // Initialize if not already done
    if (!this.#hiddenProp) return true; // Assume visible if API is not supported
    
    return !document[this.#hiddenProp];
  }

  /**
   * Registers a callback for page visibility changes.
   * @param {function(boolean): void} callback - Called with the new visibility state (true/false).
   * @returns {function(): void} Unsubscribe function to remove the listener.
   */
  static onChange (callback) {
    this.#initialize(); // Initialize if not already done
    
    if (typeof callback === 'function') {
      this.#listeners.add(callback);
    }
    
    // Unsubscribe function
    return () => {
      this.#listeners.delete(callback);
    };
  }
}

export default Browser;
