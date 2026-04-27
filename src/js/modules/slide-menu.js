import Backdrop from '../modules/backdrop.js';
import Elem from '../modules/elem.js';

/**
 * @summary Slide-in panel menu manager with backdrop and animation support.
 * @description Retains original SlideMenu features (open-only trigger, animation, modal mode).
 */
class SlideMenu {
  // --- Private Instance Fields ---
  #options;
  #listenedElement;
  #container = null;
  #sourceContent = null;
  #a11yKeydownHandler = null;
  #backdropId = null;

  // --- Static Defaults ---
  static DEFAULTS = {
    trigger: 'click',
    backdrop: false,
    content: null,
    openFunc: () => {},
    closeFunc: () => {}
  };

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['target (positional, 1st arg)', 'Target element for the slide menu. CSS selector string or HTMLElement. Required.'],
      ['trigger', 'Trigger event. Default: `click`.'],
      ['backdrop', 'Show backdrop. Default: `false`.'],
      ['content', 'Function that returns the content. Required.'],
      ['openFunc', 'Callback before opening. Optional.'],
      ['closeFunc', 'Callback before closing. Optional.']
    ]);
    const availableMethods = new Map([
      ['SlideMenu.getInstance(element)', 'Returns the SlideMenu instance for the element.'],
      ['SlideMenu.remove(element)', 'Closes the slide menu (animated).'],
      ['SlideMenu.destroy(element)', 'Destroys the slide menu completely (including listeners).'],
      ['instance.destroy()', 'Destroys the instance and cleans up all references.']
    ]);
    console.info('%cSlideMenu', 'font-size: 20px; font-weight: bold; color: red');
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
   * Returns the SlideMenu instance that contains the given element.
   * @param {Element} element - Any element inside the slide-menu.
   * @returns {SlideMenu|undefined}
   */
  static getInstance (element) {
    return element?.closest('[data-slide-menu-id]')?.__slideMenu;
  }

  /**
   * Closes the slide-menu of the given element with animation.
   * @param {Element} element - Any element inside the slide-menu.
   */
  static remove (element) {
    element?.closest('[data-slide-menu-id]')?.__slideMenu?.#remove();
  }

  /**
   * Fully destroys the slide-menu of the given element (including listeners).
   * @param {Element} element - Any element inside the slide-menu.
   */
  static destroy (element) {
    element?.closest('[data-slide-menu-id]')?.__slideMenu?.destroy();
  }

  /**
   * Creates a new SlideMenu instance.
   * @param {Object} options - SlideMenu configuration (must include `target` + `content`).
   * @param {string|HTMLElement} options.target - CSS selector string or DOM element (the trigger).
   * @throws {Error} `content` function is required.
   */
  constructor (options = {}) {
    this.#options = { ...SlideMenu.DEFAULTS, ...options };

    if (typeof this.#options.content !== 'function') {
      throw new Error('SlideMenu: `content` function is required.');
    }
    this.#listenedElement = typeof options.target === 'string' ? document.querySelector(options.target) : options.target;
    if (!(this.#listenedElement instanceof globalThis.Element)) {
      console.warn('[Sadrazam|SlideMenu] Target element not found.');

      return;
    }
    if (this.#listenedElement.__slideMenu) return this.#listenedElement.__slideMenu;

    this.#listenedElement.__slideMenu = this;
    this.#ensureAccessibility();
    this.#bindInitialTrigger();
  }

  // --- Public API ---

  destroy = () => {
    this.#remove();
    this.#listenedElement?.removeEventListener(this.#options.trigger, this.#insert);
    if (this.#a11yKeydownHandler) {
      this.#listenedElement?.removeEventListener('keydown', this.#a11yKeydownHandler);
    }
    if (this.#listenedElement) {
      this.#listenedElement.removeAttribute('role');
      this.#listenedElement.removeAttribute('tabindex');
      this.#listenedElement.removeAttribute('aria-haspopup');
      this.#listenedElement.removeAttribute('aria-expanded');
      this.#listenedElement.__slideMenu = null;
    }
  };

  // --- Private Event Handlers ---

  #insert = () => {
    // Skip if already open
    if (this.#container) return;
    
    this.#options.openFunc();
    this.#setupDOM();
    
    if (this.#options.backdrop) {
      this.#backdropId = Backdrop.insert({ onClick: this.#remove });
    }
    
    this.#container.classList.add('is-open');
    this.#listenedElement.setAttribute('aria-expanded', 'true');
    Elem.disableScroll();
    
    // Start enter animation
    this.#container.classList.add('is-entering');
    this.#container.addEventListener('animationend', () => {
      this.#container.classList.remove('is-entering');
    }, { once: true });
  };

  #remove = () => {
    if (!this.#container) return;

    this.#listenedElement.setAttribute('aria-expanded', 'false');

    if (this.#options.backdrop) {
      Backdrop.remove(this.#backdropId);
    }
    
    // Start leave animation
    this.#container.classList.add('is-leaving');
    this.#container.addEventListener('animationend', () => {
      this.#container.classList.remove('is-open');
      this.#container.classList.remove('is-leaving');
      Elem.enableScroll();
      
      this.#options.closeFunc();
      
      this.#cleanupDOM();
    }, { once: true });
  };

  // --- Private Helper Methods ---

  #ensureAccessibility = () => {
    const el = this.#listenedElement;
    const tag = el.tagName.toLowerCase();

    if (tag !== 'button' && tag !== 'a' && tag !== 'input') {
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      this.#a11yKeydownHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      };
      el.addEventListener('keydown', this.#a11yKeydownHandler);
    }

    el.setAttribute('aria-haspopup', 'dialog');
    el.setAttribute('aria-expanded', 'false');
  };

  #bindInitialTrigger = () => {
    // No toggle logic in this class; the trigger only opens.
    this.#listenedElement.addEventListener(this.#options.trigger, this.#insert);
  };
  
  #setupDOM = () => {
    const id = `slide-menu-${Date.now()}`;
    this.#listenedElement.setAttribute('data-slide-menu-id', id);

    this.#container = document.createElement('div');
    this.#container.id = id;
    this.#container.className = 'slide-menu';
    this.#container.__slideMenu = this;

    const inner = document.createElement('div');
    inner.className = 'slide-menu__inner';
    this.#container.appendChild(inner);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'slide-menu__content';
    inner.appendChild(contentContainer);

    this.#sourceContent = this.#options.content(this.#listenedElement, this);
    if (this.#sourceContent instanceof globalThis.Element) {
      while (this.#sourceContent.childNodes.length > 0) {
        contentContainer.appendChild(this.#sourceContent.childNodes[0]);
      }
      this.#sourceContent.setAttribute('data-slide-menu-id-source', id);
    } else if (typeof this.#sourceContent === 'string') {
      contentContainer.innerHTML = this.#sourceContent;
    }
    
    inner.querySelector('.slide-menu__close-button')?.addEventListener(this.#options.trigger, this.#remove);

    document.body.appendChild(this.#container);
  };

  #cleanupDOM = () => {
    if (this.#sourceContent instanceof globalThis.Element) {
      const contentContainer = this.#container?.querySelector('.slide-menu__content');
      while (contentContainer?.childNodes.length > 0) {
        this.#sourceContent.appendChild(contentContainer.childNodes[0]);
      }
      this.#sourceContent.removeAttribute('data-slide-menu-id-source');
    }
    
    this.#container?.remove();
    this.#container = null;
    this.#listenedElement.removeAttribute('data-slide-menu-id');
  };
}

export default SlideMenu;