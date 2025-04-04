import Backdrop from '../modules/backdrop.js';

/**
 * @summary Dynamic content dropdown menu manager with toggle and hover support.
 * @description Retains all original Hovermenu features (toggle, hover protection, positioning).
 */
class Hovermenu {
  // --- Private Instance Fields ---
  #config;
  #listenedElement;
  #container = null;
  #contentContainer = null;
  #sourceContent = null;
  #backdropId = null;

  // --- Static Defaults ---
  static defaultConfig = {
    selector: null,
    trigger: 'click',
    backdrop: false,
    title: null,
    content: null,
    openFunc: () => {},
    closeFunc: () => {}
  };

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['selector', 'Target element for the hovermenu. Required.'],
      ['trigger', 'Trigger event. Default: `click`.'],
      ['backdrop', 'Show backdrop. Default: `false`.'],
      ['title', 'Menu title. Default: `null`.'],
      ['content', 'Function that returns the content. Required.'],
      ['openFunc', 'Callback before opening. Optional.'],
      ['closeFunc', 'Callback before closing. Optional.']
    ]);
    const availableMethods = new Map([
      ['Hovermenu.getInstance(element)', 'Returns the Hovermenu instance for the element.'],
      ['Hovermenu.remove(element)', 'Closes the hovermenu (removes from DOM).'],
      ['Hovermenu.destroy(element)', 'Destroys the hovermenu completely (including listeners).'],
      ['instance.destroy()', 'Destroys the instance and cleans up all references.']
    ]);
    console.info('%cHovermenu', 'font-size: 20px; font-weight: bold; color: red');
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
   * Returns the Hovermenu instance that contains the given element.
   * @param {Element} element - Any element inside the hovermenu.
   * @returns {Hovermenu|undefined}
   */
  static getInstance (element) {
    return element?.closest('[data-hovermenu-id]')?.__hovermenu;
  }

  /**
   * Closes the hovermenu of the given element (removes from DOM, instance remains).
   * @param {Element} element - Any element inside the hovermenu.
   */
  static remove (element) {
    const target = element?.closest('[data-hovermenu-id]');
    target?.__hovermenu?.#remove();
  }

  /**
   * Fully destroys the hovermenu of the given element (including listeners).
   * @param {Element} element - Any element inside the hovermenu.
   */
  static destroy (element) {
    const target = element?.closest('[data-hovermenu-id]');
    target?.__hovermenu?.destroy();
  }

  /**
   * Creates a new Hovermenu instance.
   * @param {HovermenuConfig} userConfig - Hovermenu configuration.
   * @throws {Error} `content` function is required.
   */
  constructor (userConfig) {
    this.#config = { ...Hovermenu.defaultConfig, ...userConfig };

    if (typeof this.#config.content !== 'function') {
      throw new Error('Hovermenu: `content` function is required.');
    }
    if (!this.#initializeListenedElement()) return;

    this.#listenedElement.__hovermenu = this;
    this.#bindInitialTrigger();
  }

  // --- Public API ---

  destroy = () => {
    this.#remove();
    this.#listenedElement?.removeEventListener(this.#config.trigger, this.#insert);
    if (this.#listenedElement) this.#listenedElement.__hovermenu = null;
  };

  // --- Private Event Handlers ---

  #insert = (event) => {
    if (this.#container) return;
    
    this.#config.openFunc();
    this.#setupDOM();
    this.#setPosition();
    
    this.#container.classList.add('is-visible');

    if (this.#config.backdrop) {
      this.#backdropId = Backdrop.insert({ onClick: this.#remove });
    }

    this.#bindToggleListeners();
  };

  #remove = (event) => {
    if (this.#config.trigger === 'mouseenter') {
      if (event && event.relatedTarget && this.#container?.contains(event.relatedTarget)) {
        this.#container.addEventListener('mouseleave', this.#remove, { once: true });
        
        return;
      }
    }
    
    if (!this.#container) return;

    this.#config.closeFunc();

    if (this.#config.backdrop) {
      Backdrop.remove(this.#backdropId);
    }
    
    this.#unbindToggleListeners();

    this.#container.classList.remove('is-visible');
    this.#container.addEventListener('transitionend', () => {
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
      console.warn('Hovermenu: Target element not found.');
      
      return false;
    }
    
    return true;
  };

  #bindInitialTrigger = () => {
    this.#listenedElement.addEventListener(this.#config.trigger, this.#insert);
  };
  
  #bindToggleListeners = () => {
    this.#listenedElement.removeEventListener(this.#config.trigger, this.#insert);
    
    if (this.#config.trigger === 'mouseenter') {
      this.#listenedElement.addEventListener('mouseleave', this.#remove);
      this.#listenedElement.addEventListener('click', this.#remove, { once: true });
    } else {
      this.#listenedElement.addEventListener(this.#config.trigger, this.#remove);
    }
  };
  
  #unbindToggleListeners = () => {
    if (this.#config.trigger === 'mouseenter') {
      this.#listenedElement.removeEventListener('mouseleave', this.#remove);
    } else {
      this.#listenedElement.removeEventListener(this.#config.trigger, this.#remove);
    }
    this.#listenedElement.addEventListener(this.#config.trigger, this.#insert);
  };

  #setupDOM = () => {
    const id = `hovermenu-${Date.now()}`;
    this.#listenedElement.setAttribute('data-hovermenu-id', id);

    this.#container = document.createElement('div');
    this.#container.id = id;
    this.#container.className = 'hovermenu';
    // Starts with CSS opacity: 0 — becomes visible via is-visible

    const arrow = document.createElement('div');
    arrow.className = 'hovermenu__arrow-up';
    this.#container.appendChild(arrow);

    if (this.#config.title) {
      const title = document.createElement('div');
      title.innerHTML = this.#config.title;
      this.#container.appendChild(title);
    }

    this.#contentContainer = document.createElement('div');
    this.#contentContainer.className = 'hovermenu__content';
    this.#container.appendChild(this.#contentContainer);

    this.#sourceContent = this.#config.content(this.#listenedElement, this);
    if (this.#sourceContent instanceof globalThis.Element) {
      while (this.#sourceContent.childNodes.length > 0) {
        this.#contentContainer.appendChild(this.#sourceContent.childNodes[0]);
      }
    } else if (typeof this.#sourceContent === 'string') {
      this.#contentContainer.innerHTML = this.#sourceContent;
    }

    this.#listenedElement.parentNode.appendChild(this.#container);
  };

  #cleanupDOM = () => {
    if (this.#sourceContent instanceof globalThis.Element) {
      while (this.#contentContainer?.childNodes.length > 0) {
        this.#sourceContent.appendChild(this.#contentContainer.childNodes[0]);
      }
    }
    
    this.#container?.remove();
    this.#container = null;
    this.#listenedElement.removeAttribute('data-hovermenu-id');
  };

  #setPosition = () => {
    if (!this.#container) return;

    const listenedRect = this.#listenedElement.parentNode.getBoundingClientRect();
    const containerRect = this.#container.getBoundingClientRect();
    const arrow = this.#container.querySelector('.hovermenu__arrow-up, .hovermenu__arrow-down') || document.createElement('div');
    
    let arrowMargin = Math.abs(parseInt(globalThis.getComputedStyle(arrow).getPropertyValue('border-width'))) || Math.abs(parseInt(globalThis.getComputedStyle(arrow).getPropertyValue('border-bottom-width')));
    arrowMargin = (arrowMargin || 0) + 3;

    this.#container.style.left = `${(listenedRect.width - containerRect.width) / 2}px`;
    this.#container.style.top = `${listenedRect.height + arrowMargin}px`;
    
    const finalContainerRect = this.#container.getBoundingClientRect();
    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = document.documentElement.clientHeight;

    if (finalContainerRect.right > screenWidth) {
      const newLeft = screenWidth - finalContainerRect.width - 10;
      this.#container.style.left = `${newLeft - listenedRect.left}px`;
    }
    if (finalContainerRect.left < 0) {
      const newLeft = 10;
      this.#container.style.left = `${newLeft - listenedRect.left}px`;
    }
    
    const finalLeft = this.#container.getBoundingClientRect().left;
    arrow.style.left = `${listenedRect.left + (listenedRect.width / 2) - finalLeft}px`;

    if (finalContainerRect.bottom > screenHeight && (listenedRect.top - finalContainerRect.height) > 0) {
      this.#container.style.top = `-${containerRect.height + arrowMargin}px`;
      arrow.className = 'hovermenu__arrow-down';
    }
  };
}

export default Hovermenu;

