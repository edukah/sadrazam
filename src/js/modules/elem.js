/**
 * @summary Static DOM element helpers for styles, resize observation, and scrolling.
 */
class Elem {
  // --- Private Static Fields ---
  static #scrollbarWidth = null;

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableMethods = new Map([
      ['getStyle(el, styleProp)', 'Gets the computed style value of an element.'],
      ['onElementHeightChange(element, callback)', 'Runs a callback when an element is resized. Returns a ResizeObserver instance.'],
      ['getScrollbarWidth()', 'Calculates the browser scrollbar width (cached).'],
      ['flash(element)', 'Briefly flashes the element with a background highlight (.is-flashing + sdrzm-flash animation).'],
      ['scrollToView(targetElement, options?)', 'Smoothly scrolls the page to the specified element.']
    ]);
    console.info('%cElem', 'font-size: 20px; font-weight: bold; color: red');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Gets the computed style value of an element.
   * @param {HTMLElement} el - The element to get the style from.
   * @param {string} styleProp - The CSS property to get (e.g. 'font-size', 'backgroundColor').
   * @returns {string|null} The style value, or null if element not found.
   */
  static getStyle (el, styleProp) {
    if (!el) {
      console.warn('Elem.getStyle: Element not found.');
      
      return null;
    }
    
    return window.getComputedStyle(el, null).getPropertyValue(styleProp);
  }

  /**
   * Runs a callback when the element is resized.
   * @param {HTMLElement} element - The element to observe.
   * @param {function} callback - The callback to run on resize.
   * @returns {ResizeObserver|null} The observer instance (call `.disconnect()` to stop).
   */
  static onElementHeightChange (element, callback) {
    if (!element || typeof callback !== 'function') return null;

    const observer = new globalThis.ResizeObserver(callback);
    observer.observe(element);
    
    return observer;
  }

  /**
   * Calculates the browser scrollbar width (result is cached).
   * @returns {number} Scrollbar width in pixels.
   */
  static getScrollbarWidth () {
    if (this.#scrollbarWidth !== null) return this.#scrollbarWidth;

    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.remove();

    this.#scrollbarWidth = scrollbarWidth;
    
    return this.#scrollbarWidth;
  }

  /**
   * Smoothly scrolls the page to the specified element.
   * @param {HTMLElement} targetElement - The target element to scroll to.
   * @param {object} [options={}] - Optional settings.
   * @param {number} [options.margin=10] - Margin above the target in pixels.
   */
  /**
   * Briefly flashes the element with a background highlight to draw attention.
   * @param {HTMLElement} element - The element to flash.
   */
  static flash (element) {
    if (!element) return;

    element.classList.add('is-flashing');
    element.addEventListener('animationend', () => {
      element.classList.remove('is-flashing');
    }, { once: true });
  }

  static scrollToView (targetElement, { margin = 10 } = {}) {
    if (!targetElement) return;

    const elementTop = targetElement.getBoundingClientRect().top;
    const scrollY = window.scrollY;
    
    let targetPosition = scrollY + elementTop - margin;

    // Prevent scrolling past the bottom of the page
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (targetPosition > maxScroll) {
      targetPosition = maxScroll;
    }
    
    // Prevent scrolling above the top of the page
    if (targetPosition < 0) {
      targetPosition = 0;
    }

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

export default Elem;

