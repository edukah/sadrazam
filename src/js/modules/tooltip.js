/**
 * @summary Smart-positioning tooltip manager with mouse and touch support.
 * @description Displays a tooltip when hovering over or touching a specified element.
 * Automatically adjusts position based on viewport boundaries and self-destructs
 * when the trigger element is removed from the DOM.
 */
class Tooltip {
  // --- Private Instance Fields ---
  #referenceElement;
  #tooltipElement;
  #observer;
  #title;
  #placement;
  #touchHandled = false;
  #isVisible = false;

  // --- Static Structure ---
  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['*[data-toggle="tooltip"]', 'The element that triggers the tooltip.'],
      ['title', 'Text shown in the tooltip. Read from this attribute.'],
      ['data-placement', 'Tooltip position (`top`, `right`, `bottom`, `left`). Default: `top`.']
    ]);
    const availableMethods = new Map([
      ['Tooltip.listen()', 'Finds all tooltip triggers on the page and attaches listeners.'],
      ['Tooltip.getInstance(element)', 'Returns the Tooltip instance for the element.'],
      ['instance.toggle()', 'Toggles tooltip visibility.'],
      ['instance.destroy()', 'Destroys the tooltip and cleans up.']
    ]);
    console.info('%cTooltip', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%cHTML Attributes:', 'font-size: 14px; font-weight: bold; color: blue');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cAPI:', 'font-size: 14px; font-weight: bold; color: blue');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Returns the Tooltip instance for the given element.
   * @param {Element} element - Tooltip trigger element.
   * @returns {Tooltip|undefined} Tooltip instance or undefined.
   */
  static getInstance (element) {
    return element?.__tooltip;
  }

  /**
   * Finds all tooltip triggers on the page and attaches a one-time
   * initialization listener for each. Supports both mouse and touch devices.
   */
  static listen () {
    const referenceElements = document.querySelectorAll('*[data-toggle="tooltip"]');
    referenceElements.forEach(element => {
      const title = element.getAttribute('title');
      if (!element.hasAttribute('data-original-title')) {
        element.setAttribute('data-original-title', title || '');
      }
      element.setAttribute('title', ''); // Prevent the browser's native tooltip

      const initAndShow = () => {
        const tooltip = new Tooltip(element);
        if (tooltip.#title) tooltip.#show();
      };

      // Mouse: create and show on first mouseover
      element.addEventListener('mouseover', initAndShow, { once: true });

      // Touch: create and show on first touch
      element.addEventListener('touchstart', () => {
        const tooltip = new Tooltip(element);
        if (tooltip.#title) tooltip.#handleTouch();
      }, { once: true, passive: true });
    });
  }

  constructor (referenceElement) {
    // Skip if an instance already exists
    if (referenceElement.__tooltip) return referenceElement.__tooltip;

    this.#referenceElement = referenceElement;
    this.#title = this.#referenceElement.getAttribute('data-original-title');
    this.#placement = this.#getPlacement();

    if (!this.#title) return; // Skip if no title

    this.#referenceElement.__tooltip = this;

    this.#setupDOM();
    this.#calculateAndSetPosition();
    this.#bindEvents();
    this.#initObserver();
  }

  // --- Public API ---

  /**
   * Toggles tooltip visibility. Hides if visible, shows if hidden.
   */
  toggle = () => {
    if (this.#isVisible) {
      this.#hide();
    } else {
      this.#show();
    }
  };

  /**
   * Destroys the tooltip. Removes observer, event listeners, and DOM element.
   * Clears the `referenceElement.__tooltip` reference.
   */
  destroy = () => {
    this.#destroy();
  };

  // --- Private Event Handlers ---

  #show = () => {
    if (!this.#tooltipElement) return;
    this.#calculateAndSetPosition();
    this.#tooltipElement.classList.add('is-visible');
    this.#isVisible = true;
    this.#startObserver(false);
  };

  #hide = () => {
    if (!this.#tooltipElement || !this.#isVisible) return;
    this.#isVisible = false;
    this.#tooltipElement.classList.remove('is-visible');
    this.#startObserver(true);
    document.removeEventListener('touchstart', this.#handleOutsideTouch);
  };

  #handleMouseOver = () => {
    // Ignore emulated mouseover triggered after touch
    if (this.#touchHandled) return;
    this.#show();
  };

  #handleTouch = () => {
    this.#touchHandled = true;
    globalThis.setTimeout(() => {
      this.#touchHandled = false;
    }, 400);

    if (this.#isVisible) {
      this.#hide();
    } else {
      this.#show();
      // Close on outside touch
      document.addEventListener('touchstart', this.#handleOutsideTouch, { passive: true });
    }
  };

  #handleOutsideTouch = (event) => {
    if (!this.#referenceElement.contains(event.target) && !this.#tooltipElement?.contains(event.target)) {
      this.#hide();
    }
  };

  // --- Private Helper Methods ---

  #setupDOM = () => {
    const tooltipId = `tooltip-${Date.now()}`;
    this.#referenceElement.setAttribute('data-tooltip-id', tooltipId);
    this.#referenceElement.setAttribute('aria-describedby', tooltipId);

    this.#tooltipElement = document.createElement('div');
    this.#tooltipElement.id = tooltipId;
    this.#tooltipElement.className = `tooltip tooltip--${this.#placement}`;
    this.#tooltipElement.setAttribute('role', 'tooltip');
    // Starts with CSS opacity: 0 — invisible but measurable

    this.#tooltipElement.innerHTML = `<div class="tooltip__arrow"></div><span class="fsi-13 ffa-sans tc-text-white--f">${this.#title}</span>`;

    document.body.appendChild(this.#tooltipElement);
  };

  #calculateAndSetPosition = () => {
    if (!this.#tooltipElement) return;

    const refRect = this.#referenceElement.getBoundingClientRect();
    const popRect = this.#tooltipElement.getBoundingClientRect();
    const arrow = this.#tooltipElement.querySelector('.tooltip__arrow');
    const arrowSize = 6;

    // Reset arrow styles (may remain from a previous calculation)
    arrow.style.left = '';
    arrow.style.top = '';

    let placement = this.#placement;

    const positions = {
      top: {
        x: refRect.left + (refRect.width / 2) - (popRect.width / 2),
        y: refRect.top - popRect.height - arrowSize
      },
      right: {
        x: refRect.right + arrowSize,
        y: refRect.top + (refRect.height / 2) - (popRect.height / 2)
      },
      bottom: {
        x: refRect.left + (refRect.width / 2) - (popRect.width / 2),
        y: refRect.bottom + arrowSize
      },
      left: {
        x: refRect.left - popRect.width - arrowSize,
        y: refRect.top + (refRect.height / 2) - (popRect.height / 2)
      }
    };

    let { x, y } = positions[placement];

    // Check viewport boundaries and flip placement if needed
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;

    if (placement === 'right' && x + popRect.width > clientWidth) placement = 'left';
    if (placement === 'left' && x < 0) placement = 'right';
    if (placement === 'top' && y < 0) placement = 'bottom';
    if (placement === 'bottom' && y + popRect.height > clientHeight) placement = 'top';

    // Recalculate position based on new placement
    ({ x, y } = positions[placement]);
    this.#tooltipElement.className = `tooltip tooltip--${placement}`;

    // Check horizontal overflow and adjust arrow position
    if (x < 0) {
      arrow.style.left = `${Math.max(10, popRect.width / 2 + x)}px`;
      x = 10;
    }
    if (x + popRect.width > clientWidth) {
      const overflow = (x + popRect.width) - clientWidth;
      arrow.style.left = `${popRect.width / 2 + overflow}px`;
      x -= (overflow + 10);
    }

    this.#tooltipElement.style.top = `${y + window.scrollY}px`;
    this.#tooltipElement.style.left = `${x + window.scrollX}px`;
  };

  #bindEvents = () => {
    this.#referenceElement.addEventListener('mouseover', this.#handleMouseOver);
    this.#referenceElement.addEventListener('mouseleave', this.#hide);
    this.#referenceElement.addEventListener('touchstart', this.#handleTouch, { passive: true });
  };

  #getPlacement = () => {
    const placement = this.#referenceElement.getAttribute('data-placement');
    if (placement && ['top', 'right', 'bottom', 'left'].includes(placement)) {
      return placement;
    }

    return 'top'; // Default
  };

  #initObserver = () => {
    this.#observer = new globalThis.MutationObserver(this.#observerHandler);
    this.#startObserver(true); // Start in sleep mode
  };

  #observerHandler = (mutationList) => {
    if (!document.body.contains(this.#referenceElement)) {
      this.#destroy();

      return;
    }
    for (const mutation of mutationList) {
      if (mutation.target?.contains(this.#referenceElement) && globalThis.getComputedStyle(mutation.target).display === 'none') {
        this.#hide();
      }
    }
  };

  #startObserver = (sleepMode = true) => {
    this.#observer?.disconnect();
    const options = sleepMode ? { childList: true } : { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] };
    this.#observer?.observe(document.body, options);
  };

  #destroy = () => {
    this.#observer?.disconnect();
    this.#tooltipElement?.remove();
    this.#referenceElement.removeEventListener('mouseover', this.#handleMouseOver);
    this.#referenceElement.removeEventListener('mouseleave', this.#hide);
    this.#referenceElement.removeEventListener('touchstart', this.#handleTouch);
    document.removeEventListener('touchstart', this.#handleOutsideTouch);
    if (this.#referenceElement) {
      this.#referenceElement.removeAttribute('aria-describedby');
      this.#referenceElement.__tooltip = null;
    }
  };
}

export default Tooltip;
