/**
 * @summary Static DOM element helpers for styles, resize observation, and scrolling.
 */
class Elem {
  // --- Private Static Fields ---
  static #scrollbarWidth = null;
  // Owner IDs, not a bare count. A count can be decremented by a caller that never
  // incremented it — measured twice in the wild: a resize handler released a layer's
  // lock it never took, and Modal acquired once per modal but released only when the
  // last one closed, leaving the page permanently `overflow: hidden`. Backdrop already
  // uses owner IDs; this mirrors it.
  static #scrollLockOwners = [];

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableMethods = new Map([
      ['getStyle(el, styleProp)', 'Gets the computed style value of an element.'],
      ['onElementHeightChange(element, callback)', 'Runs a callback when an element is resized. Returns a ResizeObserver instance.'],
      ['getScrollbarWidth()', 'Calculates the browser scrollbar width (cached).'],
      ['disableScroll(ownerId?)', 'Disables page scrolling. Scrollbar hidden, space preserved via paddingRight. Returns an `ownerId`.'],
      ['enableScroll(ownerId)', 'Withdraws one lock request. `ownerId` is required — releasing a lock you do not hold is ignored.'],
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
      console.warn('[Sadrazam|Elem] getStyle: Element not found.');
      
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
   * Disables page scrolling. Scrollbar is hidden but its space is preserved via paddingRight.
   * Multiple owners may hold the lock at once; it is released when the last one lets go.
   * @param {string} [ownerId] - Unique owner ID. Auto-generated if omitted. Re-locking with the
   *   same ID is a no-op, so callers reached from more than one path stay idempotent.
   * @returns {string} The `ownerId` to pass back to `enableScroll()`.
   */
  static disableScroll (ownerId) {
    const finalOwnerId = ownerId ?? `scroll-lock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (!this.#scrollLockOwners.includes(finalOwnerId)) {
      this.#scrollLockOwners.push(finalOwnerId);
    }

    if (this.#scrollLockOwners.length === 1) {
      const scrollbarWidth = globalThis.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.classList.add('is-locked');
      document.body.classList.add('is-locked');
    }

    return finalOwnerId;
  }

  /**
   * Withdraws one lock request. Scrolling resumes once no owner is left.
   * @param {string} ownerId - The ID returned by `disableScroll()`. REQUIRED: without it a caller
   *   could release a lock it never took, which is exactly how the page ended up scroll-dead
   *   after a modal + toast, and how a resize handler unlocked the page behind a blocking layer.
   */
  static enableScroll (ownerId) {
    if (!ownerId) {
      console.warn('[Sadrazam|Elem] enableScroll: `ownerId` is required — call ignored. Pass the ID returned by disableScroll().');

      return;
    }

    const index = this.#scrollLockOwners.indexOf(ownerId);

    // Not an owner — nothing to release. Silent on purpose: releasing twice (e.g. a close
    // handler that also fires on resize) is legitimate, only the first call does the work.
    if (index === -1) return;

    this.#scrollLockOwners.splice(index, 1);

    if (this.#scrollLockOwners.length === 0) {
      document.documentElement.classList.remove('is-locked');
      document.documentElement.style.paddingRight = '';
      document.body.classList.remove('is-locked');
    }
  }

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

