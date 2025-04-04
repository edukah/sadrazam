/**
 * @summary Smart-positioning popover manager with configurable triggers.
 * @description Displays a popover on a specified element, triggered by an event.
 * Automatically adjusts position based on viewport boundaries and self-destructs
 * when the trigger element is removed from the DOM.
 */
class Popover {
  // --- Private Instance Fields ---

  /** @type {PopoverConfig} */
  #config;
  /** @type {HTMLElement} */
  #referenceElement;
  /** @type {HTMLElement} */
  #popoverElement;
  /** @type {MutationObserver} */
  #observer;
  /** @type {boolean} */
  #isVisible = false;

  // --- Static Structure ---

  /**
   * Default popover configuration.
   * @type {PopoverConfig}
   */
  static defaultConfig = {
    referenceElement: null,
    trigger: 'click',
    placement: 'bottom',
    title: null,
    content: () => ''
  };

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['selector', 'Element that triggers the popover. CSS selector string or HTMLElement. Required.'],
      ['trigger', 'Trigger event. Default: `click`.'],
      ['placement', 'Popover position (`top`, `right`, `bottom`, `left`). Default: `bottom`.'],
      ['title', 'Popover title. Default: `null`.'],
      ['content', 'Function that returns the content. Required.']
    ]);
    const availableMethods = new Map([
      ['Popover.listen(config)', 'Adds a lazy popover listener for the specified element.'],
      ['Popover.getInstance(element)', 'Returns the Popover instance for the element.'],
      ['instance.show()', 'Shows the popover and recalculates position.'],
      ['instance.hide()', 'Hides the popover (fade-out).'],
      ['instance.toggle()', 'Toggles visibility.'],
      ['instance.destroy()', 'Destroys the popover and cleans up.']
    ]);
    console.info('%cPopover', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%cConfig:', 'font-size: 14px; font-weight: bold; color: blue');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cAPI:', 'font-size: 14px; font-weight: bold; color: blue');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Returns the Popover instance for the given element.
   * @param {Element} element - Popover trigger element.
   * @returns {Popover|undefined} Popover instance or `undefined`.
   */
  static getInstance (element) {
    return element?.__popover;
  }

  /**
   * Adds a one-time popover initialization listener for the specified element.
   * The instance is created on first trigger and manages its own lifecycle thereafter.
   * @param {PopoverListenConfig} config - Popover settings (`selector` + standard config).
   */
  static listen (config) {
    let referenceElement;
    if (typeof config.selector === 'string') {
      referenceElement = document.querySelector(config.selector);
    } else if (config.selector instanceof globalThis.HTMLElement) {
      referenceElement = config.selector;
    }

    if (!referenceElement) {
      console.warn(`Popover: Element (${config.selector}) not found.`);

      return;
    }

    // `{ once: true }` auto-removes this listener after the first trigger.
    referenceElement.addEventListener(config.trigger, () => {
      new Popover({ referenceElement, ...config });
    }, { once: true });
  }

  /**
   * Creates and shows a new Popover instance.
   * The instance is stored on `referenceElement.__popover`.
   * @param {PopoverConfig} [options={}] - Popover settings.
   */
  constructor (options = {}) {
    this.#config = { ...Popover.defaultConfig, ...options };
    this.#referenceElement = this.#config.referenceElement;

    if (!this.#referenceElement) return;

    this.#referenceElement.style.cursor = 'pointer';
    this.#referenceElement.__popover = this;

    this.#setupDOM();
    this.#calculateAndSetPosition();
    this.#bindEvents();
    this.#initObserver();

    // Show the popover
    this.show();
  }

  // --- Public API ---

  /**
   * Shows the popover. Recalculates position and applies fade-in.
   * Activates the window resize listener.
   */
  show = () => {
    if (!this.#popoverElement) return;
    this.#calculateAndSetPosition();
    this.#popoverElement.classList.add('is-visible');
    this.#isVisible = true;
    this.#startObserver(false);
    globalThis.addEventListener('resize', this.#resizeHandler);
  };

  /**
   * Hides the popover with a fade-out animation.
   * Deactivates the window resize listener.
   */
  hide = () => {
    if (!this.#popoverElement || !this.#isVisible) return;
    this.#isVisible = false;
    this.#popoverElement.classList.remove('is-visible');
    this.#startObserver(true);
    globalThis.removeEventListener('resize', this.#resizeHandler);
  };

  /**
   * Toggles popover visibility. Hides if visible, shows if hidden.
   */
  toggle = () => {
    if (this.#isVisible) {
      this.hide();
    } else {
      this.show();
    }
  };

  /**
   * Destroys the popover. Removes observer, event listeners, and DOM element.
   * Clears the `referenceElement.__popover` reference.
   */
  destroy = () => {
    this.#observer?.disconnect();
    globalThis.removeEventListener('resize', this.#resizeHandler);

    const { trigger } = this.#config;
    const mutualEvents = { mouseover: 'mouseout', focus: 'blur' };

    this.#referenceElement?.removeEventListener(trigger, this.toggle);
    if (mutualEvents[trigger]) {
      this.#referenceElement?.removeEventListener(mutualEvents[trigger], this.toggle);
    }

    this.#popoverElement?.remove();
    if (this.#referenceElement) {
      this.#referenceElement.__popover = null;
    }
  };

  // --- Private Event Handlers ---

  /** Hides the popover on window resize. */
  #resizeHandler = () => {
    this.hide();
  };

  // --- Private Helper Methods ---

  /** Creates the popover DOM structure and appends it to `document.body`. */
  #setupDOM = () => {
    const { title, content, placement } = this.#config;
    const popoverId = `popover-${Date.now()}`;

    this.#referenceElement.setAttribute('data-popover-id', popoverId);

    this.#popoverElement = document.createElement('div');
    this.#popoverElement.id = popoverId;
    this.#popoverElement.className = `popover popover--${placement}`;
    // Starts with CSS opacity: 0 — invisible but measurable

    const titleHTML = title ? `<div class="popover__title fsi-13 fwe-semibold ffa-sans">${title}</div>` : '';
    const contentResult = content(popoverId);
    const contentHTML = contentResult instanceof globalThis.HTMLElement ? contentResult.outerHTML : contentResult;

    this.#popoverElement.innerHTML = `${titleHTML}<div class="popover__content">${contentHTML}</div><div class="popover__arrow"></div>`;

    document.body.appendChild(this.#popoverElement);
  };

  /**
   * Calculates and applies the popover position relative to the reference element.
   * Auto-flips placement and adjusts arrow position based on viewport boundaries.
   */
  #calculateAndSetPosition = () => {
    if (!this.#popoverElement) return;

    const refRect = this.#referenceElement.getBoundingClientRect();
    const popRect = this.#popoverElement.getBoundingClientRect();
    const arrow = this.#popoverElement.querySelector('.popover__arrow');
    const arrowSize = 10;

    // Reset arrow styles
    arrow.style.left = '';
    arrow.style.top = '';

    let placement = this.#config.placement;

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
    this.#popoverElement.className = `popover popover--${placement}`;

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

    this.#popoverElement.style.top = `${y + window.scrollY}px`;
    this.#popoverElement.style.left = `${x + window.scrollX}px`;
  };

  /** Binds trigger event listeners to the reference element. */
  #bindEvents = () => {
    const { trigger } = this.#config;
    const mutualEvents = { mouseover: 'mouseout', focus: 'blur' };

    this.#referenceElement.addEventListener(trigger, this.toggle);
    if (mutualEvents[trigger]) {
      this.#referenceElement.addEventListener(mutualEvents[trigger], this.toggle);
    }
  };

  /** Creates the MutationObserver and starts it in sleep mode. */
  #initObserver = () => {
    this.#observer = new globalThis.MutationObserver(this.#observerHandler);
    this.#startObserver(true); // Start in sleep mode
  };

  /**
   * Observer callback. Destroys the popover if the trigger element is removed from
   * the DOM, or hides it if the trigger element becomes hidden.
   * @param {MutationRecord[]} mutationList
   */
  #observerHandler = (mutationList) => {
    if (!document.body.contains(this.#referenceElement)) {
      this.destroy();

      return;
    }
    for (const mutation of mutationList) {
      if (mutation.target.contains(this.#referenceElement) && globalThis.getComputedStyle(mutation.target).display === 'none') {
        this.hide();
      }
    }
  };

  /**
   * (Re)starts the observer in the specified mode.
   * @param {boolean} [sleepMode=true] - `true` observes childList only (sleep mode),
   *   `false` also observes subtree + attribute changes (active mode).
   */
  #startObserver = (sleepMode = true) => {
    this.#observer.disconnect();
    const options = sleepMode ? { childList: true } : { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] };
    this.#observer.observe(document.body, options);
  };
}

/**
 * @typedef {object} PopoverConfig
 * @property {HTMLElement} [referenceElement] - Trigger element the popover attaches to.
 * @property {'click'|'mouseover'|'focus'} [trigger='click'] - Trigger event type.
 * @property {'top'|'right'|'bottom'|'left'} [placement='bottom'] - Preferred position.
 * @property {string|null} [title=null] - Popover title HTML.
 * @property {function(string): (string|HTMLElement)} [content] - Function that returns the content. Receives the popover ID as parameter.
 */

/**
 * @typedef {PopoverConfig & {selector: string|HTMLElement}} PopoverListenConfig
 * @property {string|HTMLElement} selector - CSS selector or HTMLElement. Required for `listen()`.
 */

export default Popover;
