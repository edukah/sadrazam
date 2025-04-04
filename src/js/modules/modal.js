import Backdrop from '../modules/backdrop.js';
import Ajax from '../services/ajax.js';
// import Elem from '../modules/elem.js';
import { InsertScript } from '../helpers/document.js';

/**
 * @summary Modal dialog manager with backdrop, focus trap, and auto-dismiss.
 */
class Modal {
  // --- Private Instance Fields ---
  #config;
  #modalElement;
  #modalContentElement;
  #backdropId = null;
  #closeTimer = null;
  #previouslyFocusedElement = null;

  // --- Static Config ---
  static defaultConfig = {
    content: '',
    size: 'md',
    position: 'center',
    className: '',
    time: false,
    closeOnOuterClick: false,
    closeOnClick: false,
    closeAfterFunction: null,
    closeOtherModals: false
  };

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['content', 'Content to place inside the modal. HTML string or DOM Element. Required.'],
      ['size', 'Modal size (`sm`, `md`, `lg`, `fullscreen`). Default: `md`.'],
      ['position', 'Vertical position (`top`, `center`, `bottom`). Default: `center`.'],
      ['className', 'Optional CSS class added to the modal__dialog element. Default: empty.'],
      ['time', 'Auto-close delay in ms. `false` disables auto-close. Default: `false`.'],
      ['closeOnOuterClick', 'Closes on click outside the modal content or on the backdrop. Default: `false`.'],
      ['closeOnClick', 'Closes on any click, including inside the modal content. Default: `false`.'],
      ['closeAfterFunction', 'Callback fired after the modal closes. Optional.'],
      ['closeOtherModals', 'Closes other open modals when this modal opens. Default: `false`.']
    ]);
    const availableMethods = new Map([
      ['Modal.insert(options)', 'Creates and shows a new modal. Returns the Modal instance.'],
      ['Modal.getInstance(element)', 'Returns the Modal instance containing the given element.'],
      ['Modal.login(closeAfterFunction?)', 'Loads the login form via AJAX and shows it in a modal.'],
      ['instance.close()', 'Closes and cleans up the modal.'],
      ['instance.destroy()', 'Alias for close().'],
      ['instance.querySelector(selector)', 'Finds an element inside the modal.'],
      ['instance.querySelectorAll(selector)', 'Finds all matching elements inside the modal.']
    ]);
    const usageGuide = [
      'Content is auto-wrapped with .modal__dialog + .modal__content.',
      'Templates should NOT include modal__dialog or modal__content — only inner content.',
      'Use .modal__header, .modal__body, .modal__footer inside content for layout (optional).',
      'Scope classes/IDs go on .modal__body, not as a wrapper div (breaks flex layout).',
      'If content already contains .modal__dialog (legacy), it is used as-is (backward compat).'
    ];

    console.info('%cModal', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%cConfig:', 'font-size: 14px; font-weight: bold; color: blue');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cAPI:', 'font-size: 14px; font-weight: bold; color: blue');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cUsage:', 'font-size: 14px; font-weight: bold; color: blue');
    usageGuide.forEach((line) => {
      console.info(`%c• ${line}`, 'font-weight: normal; color: unset');
    });
  }

  /**
   * Creates a new modal and displays it.
   * @param {object} options - Modal options.
   * @returns {Modal} The created Modal instance.
   */
  static insert (options = {}) {
    return new this(options);
  }

  /**
   * Returns the Modal instance containing the given element.
   * @param {Element} element - Any element inside the modal.
   * @returns {Modal|undefined} The Modal instance, or undefined.
   */
  static getInstance (element) {
    return element?.closest('.modal')?.__modal;
  }

  /**
   * Loads the login form via AJAX and displays it in a modal.
   * @param {function} [closeAfterFunction] - Optional callback to run after the modal closes.
   */
  static login (closeAfterFunction) {
    Ajax.send({
      success: (xhttp) => {
        Modal.insert({ content: xhttp.responseText, closeAfterFunction });
      },
      route: 'account/join_us/ajax',
      spinner: 'helper'
    });
  }

  constructor (options = {}) {
    this.#config = { ...Modal.defaultConfig, ...options };
    this.#previouslyFocusedElement = document.activeElement;

    if (this.#config.closeOtherModals) {
      this.#closeOtherModals();
    }

    this.#setupDOM();
    if (!this.#modalContentElement) return; // No content, abort

    this.#bindEvents();
    this.#insertIntoDOM();

    if (typeof this.#config.time === 'number') {
      this.#closeTimer = globalThis.setTimeout(this.close, this.#config.time);
    }
  }

  // --- Public Methods ---
  
  /**
   * Closes the modal and cleans up.
   */
  destroy = () => this.close();

  close = () => {
    if (!this.#modalElement) return; // Already closed

    document.removeEventListener('keydown', this.#handleKeydown);

    this.#modalElement.remove();
    this.#modalElement = null;

    Backdrop.remove(this.#backdropId);

    if (!document.querySelector('body > .modal')) {
      document.body.classList.remove('is-scroll-locked');
    }

    globalThis.clearTimeout(this.#closeTimer);

    // Restore focus to the previously focused element
    if (this.#previouslyFocusedElement && document.body.contains(this.#previouslyFocusedElement)) {
      this.#previouslyFocusedElement.focus();
    }

    if (typeof this.#config.closeAfterFunction === 'function') {
      this.#config.closeAfterFunction();
    }
  };

  /**
   * Finds and returns an element inside the modal.
   * @param {string} selector - CSS selector.
   * @returns {Element|null} The found element, or null.
   */
  querySelector (selector) {
    return this.#modalElement?.querySelector(selector);
  }

  /**
   * Finds and returns all matching elements inside the modal.
   * @param {string} selector - CSS selector.
   * @returns {NodeList} The matching elements.
   */
  querySelectorAll (selector) {
    return this.#modalElement?.querySelectorAll(selector);
  }

  // --- Private Helper Methods ---

  #setupDOM = () => {
    this.#modalElement = document.createElement('div');
    this.#modalElement.className = 'modal';
    this.#modalElement.setAttribute('role', 'dialog');
    this.#modalElement.setAttribute('aria-modal', 'true');
    this.#modalElement.__modal = this;

    const modalInner = document.createElement('div');
    modalInner.className = 'modal__inner';

    const { position } = this.#config;
    if (position && position !== 'center') {
      modalInner.classList.add(`modal__inner--${position}`);
    }

    this.#modalElement.appendChild(modalInner);

    const { content } = this.#config;
    if (content instanceof globalThis.Element) {
      modalInner.appendChild(content);
    } else if (typeof content === 'string') {
      modalInner.innerHTML = content;
    }

    // Backward compat: if content already contains modal__dialog, leave it as-is
    const existingDialog = modalInner.querySelector('.modal__dialog');

    if (existingDialog) {
      this.#modalContentElement = modalInner.querySelector('.modal__content');
    } else {
      // New behavior: auto-create modal__dialog + modal__content wrappers
      const dialog = document.createElement('div');
      dialog.className = 'modal__dialog';

      const { size, className } = this.#config;
      if (size) dialog.classList.add(`modal__dialog--${size}`);
      if (className) dialog.classList.add(className);

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'modal__content';

      // Move all children from modalInner to contentWrapper
      while (modalInner.firstChild) {
        contentWrapper.appendChild(modalInner.firstChild);
      }

      dialog.appendChild(contentWrapper);
      modalInner.appendChild(dialog);
      this.#modalContentElement = contentWrapper;
    }

    if (!this.#modalContentElement) {
      throw new Error('Modal: Element with `.modal__content` class not found.');
    }

    // aria-labelledby: link to modal heading if present
    const heading = this.#modalContentElement.querySelector('.modal__header, h1, h2, h3, [data-modal-title]');
    if (heading) {
      if (!heading.id) heading.id = `modal-title-${Date.now()}`;
      this.#modalElement.setAttribute('aria-labelledby', heading.id);
    }
  };

  #bindEvents = () => {
    // Bind close event to [data-modal-close] buttons
    this.#modalElement.querySelectorAll('[data-modal-close]').forEach(elem => {
      elem.addEventListener('click', this.close);
    });

    // Escape key close + focus trap
    document.addEventListener('keydown', this.#handleKeydown);

    // If closeOnOuterClick is active, close on backdrop or outer click
    if (this.#config.closeOnClick) {
      this.#backdropId = Backdrop.insert({ onClick: this.close });

      this.#modalElement.addEventListener('click', (event) => {
        this.close();
      });
    } else if (this.#config.closeOnOuterClick) {
      this.#backdropId = Backdrop.insert({ onClick: this.close });

      this.#modalElement.addEventListener('click', (event) => {
        // Ensure click target is the outer wrapper, not the modal content itself
        if (event.target && !this.#modalContentElement.isSameNode(event.target) && !this.#modalContentElement.contains(event.target)) {
          this.close();
        }
      });
    } else {
      this.#backdropId = Backdrop.insert();
    }
  };

  #handleKeydown = (event) => {
    if (event.key === 'Escape') {
      // Only close the topmost (last inserted) modal on Escape
      const modals = document.querySelectorAll('body > .modal');
      if (modals.length > 0 && modals[modals.length - 1] === this.#modalElement) {
        this.close();
      }

      return;
    }

    // Focus trap: keep Tab cycling within the modal
    if (event.key === 'Tab') {
      if (!this.#modalElement) return;
      const focusableElements = this.#modalElement.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  };
  
  #insertIntoDOM = () => {
    document.body.classList.add('is-scroll-locked');
    document.body.appendChild(this.#modalElement);

    // Execute scripts inside the modal
    globalThis.setTimeout(() => InsertScript.run(this.#modalElement), 0);

    // Focus the first focusable element
    globalThis.setTimeout(() => {
      const firstFocusable = this.#modalElement.querySelector(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        this.#modalElement.setAttribute('tabindex', '-1');
        this.#modalElement.focus();
      }
    }, 0);
  };
  
  #closeOtherModals = () => {
    document.querySelectorAll('body > .modal').forEach(otherModal => {
      otherModal.__modal?.close();
    });
  };
}

export default Modal;