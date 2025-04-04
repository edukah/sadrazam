import Backdrop from '../modules/backdrop.js';
// import Elem from '../modules/elem.js';

/**
 * @summary Slide-in panel menu manager with backdrop and animation support.
 * @description Retains original SlideMenu features (open-only trigger, animation, modal mode).
 */
class SlideMenu {
  // --- Private Instance Fields ---
  #config;
  #listenedElement;
  #container = null;
  #sourceContent = null;
  #backdropId = null;

  // --- Static Defaults ---
  static defaultConfig = {
    selector: null,
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
      ['selector', 'Target element for the slide menu. Required.'],
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
   * @param {SlideMenuConfig} userConfig - SlideMenu configuration.
   * @throws {Error} `content` function is required.
   */
  constructor (userConfig) {
    this.#config = { ...SlideMenu.defaultConfig, ...userConfig };

    if (typeof this.#config.content !== 'function') {
      throw new Error('SlideMenu: `content` function is required.');
    }
    if (!this.#initializeListenedElement()) return;

    this.#listenedElement.__slideMenu = this;
    this.#bindInitialTrigger();
  }

  // --- Public API ---

  destroy = () => {
    this.#remove();
    this.#listenedElement?.removeEventListener(this.#config.trigger, this.#insert);
    if (this.#listenedElement) this.#listenedElement.__slideMenu = null;
  };

  // --- Private Event Handlers ---

  #insert = () => {
    // Skip if already open
    if (this.#container) return;
    
    this.#config.openFunc();
    this.#setupDOM();
    
    if (this.#config.backdrop) {
      this.#backdropId = Backdrop.insert({ onClick: this.#remove });
    }
    
    this.#container.classList.add('is-open');
    document.body.classList.add('is-scroll-locked');
    
    // Start enter animation
    this.#container.classList.add('is-entering');
    this.#container.addEventListener('animationend', () => {
      this.#container.classList.remove('is-entering');
    }, { once: true });
  };

  #remove = () => {
    if (!this.#container) return;

    if (this.#config.backdrop) {
      Backdrop.remove(this.#backdropId);
    }
    
    // Start leave animation
    this.#container.classList.add('is-leaving');
    this.#container.addEventListener('animationend', () => {
      this.#container.classList.remove('is-open');
      this.#container.classList.remove('is-leaving');
      document.body.classList.remove('is-scroll-locked');
      
      this.#config.closeFunc();
      
      this.#cleanupDOM();
    }, { once: true });
  };

  // --- Private Helper Methods ---

  #initializeListenedElement = () => {
    const { selector } = this.#config;
    if (selector instanceof globalThis.Element) {
      this.#listenedElement = selector;
    } else if (typeof selector === 'string') {
      this.#listenedElement = document.querySelector(selector);
    }

    if (!this.#listenedElement) {
      console.warn('SlideMenu: Target element not found.');
      
      return false;
    }
    
    return true;
  };

  #bindInitialTrigger = () => {
    // No toggle logic in this class; the trigger only opens.
    this.#listenedElement.addEventListener(this.#config.trigger, this.#insert);
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

    this.#sourceContent = this.#config.content(this.#listenedElement, this);
    if (this.#sourceContent instanceof globalThis.Element) {
      while (this.#sourceContent.childNodes.length > 0) {
        contentContainer.appendChild(this.#sourceContent.childNodes[0]);
      }
      this.#sourceContent.setAttribute('data-hovermenu-id-source', id);
    } else if (typeof this.#sourceContent === 'string') {
      contentContainer.innerHTML = this.#sourceContent;
    }
    
    inner.querySelector('.slide-menu__close-button')?.addEventListener(this.#config.trigger, this.#remove);

    document.body.appendChild(this.#container);
  };

  #cleanupDOM = () => {
    if (this.#sourceContent instanceof globalThis.Element) {
      const contentContainer = this.#container?.querySelector('.slide-menu__content');
      while (contentContainer?.childNodes.length > 0) {
        this.#sourceContent.appendChild(contentContainer.childNodes[0]);
      }
      this.#sourceContent.removeAttribute('data-hovermenu-id-source');
    }
    
    this.#container?.remove();
    this.#container = null;
    this.#listenedElement.removeAttribute('data-slide-menu-id');
  };
}

export default SlideMenu;