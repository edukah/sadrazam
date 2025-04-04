import Cookie from '../helpers/cookie.js';

/**
 * @summary Scroll position persistence manager using cookies and throttled updates.
 */
class ScrollHistory {
  // --- Private Static Fields ---
  static #isListening = false;
  static #throttleTimer = null;
  static #cookieKey = window.location.href;
  static #cookieTimeOutMs = 60000;

  // --- Static Config ---
  static throttleTime = 250; // Cookie write frequency during scroll (ms)

  /**
   * Prints available configuration options to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['listen({ cookieTimeOut })', 'Starts the scroll history manager. `cookieTimeOut` in seconds. Default: `60` seconds.']
    ]);
    console.info('%cScrollHistory', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Starts the scroll position manager.
   * @param {object} [options] - Optional settings.
   * @param {number} [options.cookieTimeOut=60] - Cookie expiration time (seconds).
   */
  static listen ({ cookieTimeOut = 60 } = {}) {
    if (this.#isListening) return;

    this.#cookieTimeOutMs = (cookieTimeOut >= 0 ? cookieTimeOut : 999999999) * 1000;
    
    this.#restorePosition();
    this.#startListening();
    this.#isListening = true;
  }

  // --- Private Event Handlers ---

  static #handleScroll = () => {
    // Throttling: Prevent the scroll event from firing too often and writing to cookie continuously.
    if (this.#throttleTimer) return;

    this.#throttleTimer = globalThis.setTimeout(() => {
      this.#savePosition();
      this.#throttleTimer = null;
    }, this.throttleTime);
  };

  // --- Private Helper Methods ---

  /**
   * Restores the saved scroll position from cookie on page load.
   */
  static #restorePosition = () => {
    const savedScrollTop = Cookie.get(this.#cookieKey);
    if (savedScrollTop) {
      // If the user has already scrolled before the script loaded, don't change position.
      if (window.scrollY < 1) {
        window.scrollTo(0, parseInt(savedScrollTop, 10));
      }
    }
  };

  /**
   * Saves the current scroll position to cookie.
   */
  static #savePosition = () => {
    const currentScrollTop = window.scrollY;
    Cookie.set(this.#cookieKey, currentScrollTop, this.#cookieTimeOutMs);
  };
  
  /**
   * Starts listening to scroll events.
   */
  static #startListening = () => {
    window.addEventListener('scroll', this.#handleScroll);
    window.addEventListener('touchmove', this.#handleScroll);
  };
}

export default ScrollHistory;
