import Elem from './elem.js';

const HEADING_SELECTOR = '.tab-capsule__heading, .tab-scroll__heading, .tab-card__heading, .tab-classic__heading';

/**
 * @summary Tabbed content manager with URL hash sync and external triggers.
 */
class Tabs {
  // --- Private Instance Fields ---
  #tabContainer;
  #tabHeads;
  #activeTabHead = null;
  #clickHandlers = new Map();
  #hashTargetElement = null;
  #storageKey;

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableAttributes = new Map([
      ['.tab-classic__heading (or tab-card/tab-scroll/tab-capsule)', 'Main wrapper element containing tab headings.'],
      ['*[data-tab-id]', 'Matching ID for each tab heading and its content panel.'],
      ['id="tab-ID"', 'Content panel ID. Must match the `data-tab-id` above.'],
      ['.is-default', 'Marks which tab opens by default (fallback when no hash or session).'],
      ['*[data-tab-hash]', 'Custom hash value. Sets URL to #value on select, restores tab on page load.'],
      ['*[data-tab-target]', 'Activates a tab from outside the tab group and scrolls to it.']
    ]);
    const availableMethods = new Map([
      ['Tabs.listen()', 'Finds and initializes all tab groups on the page.'],
      ['Tabs.getInstance(element)', 'Returns the Tabs instance for the element.'],
      ['instance.activateTab(tabHead)', 'Activates the specified tab.'],
      ['instance.destroy()', 'Destroys and cleans up the Tabs instance.']
    ]);
    console.info('%cTabs', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%cHTML Attributes:', 'font-size: 14px; font-weight: bold; color: blue');
    availableAttributes.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cAPI:', 'font-size: 14px; font-weight: bold; color: blue');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Returns the Tabs instance for the given element.
   * @param {Element} element - A tab heading or container element.
   * @returns {Tabs|undefined} The Tabs instance, or undefined.
   */
  static getInstance (element) {
    return element?.__tabs ?? element?.closest('[data-tab-id]')?.__tabs;
  }

  /**
   * Finds all tab groups on the page and initializes a Tabs instance for each.
   * Also listens for external control links and in-page hash links.
   */
  static listen () {
    document.querySelectorAll(HEADING_SELECTOR).forEach(container => new this(container));

    document.querySelectorAll('*[data-tab-target]').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-tab-target');
        const targetTabHead = document.querySelector(`*[data-tab-id="${targetId}"]`);

        const tabsInstance = targetTabHead?.__tabs;
        if (tabsInstance) {
          tabsInstance.activateTab(targetTabHead);
          const targetPanel = document.getElementById(targetId);
          globalThis.setTimeout(() => {
            if (targetPanel) {
              Elem.scrollToView(targetPanel);
            }
          }, 50);
        }
      });
    });

    // --- In-page hash link tab control ---
    document.body.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link || !link.hash) return;

      const hashValue = link.hash.substring(1);

      // 1. Hash, bir tab'ın data-tab-hash değeriyle eşleşiyor mu?
      const matchedHead = document.querySelector(`*[data-tab-hash="${hashValue}"]`);
      if (matchedHead) {
        const tabsInstance = matchedHead.__tabs;
        if (tabsInstance) {
          event.preventDefault();
          tabsInstance.activateTab(matchedHead);
          const targetPanel = document.getElementById(matchedHead.getAttribute('data-tab-id'));
          globalThis.setTimeout(() => {
            if (targetPanel) {
              Elem.scrollToView(targetPanel);
            }
          }, 50);
        }

        return;
      }

      // 2. Hash bir element ID'si mi ve bu element bir tab panelinin içinde mi?
      const targetElement = document.getElementById(hashValue);
      if (targetElement) {
        for (const container of document.querySelectorAll(HEADING_SELECTOR)) {
          const tabsInstance = container.__tabs;
          if (!tabsInstance) continue;

          for (const head of container.querySelectorAll('*[data-tab-id]')) {
            const panel = document.getElementById(head.getAttribute('data-tab-id'));
            if (panel && panel.contains(targetElement)) {
              event.preventDefault();
              tabsInstance.activateTab(head);
              globalThis.setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                Elem.flash(targetElement);
              }, 50);

              return;
            }
          }
        }
      }
    });
  }

  constructor (tabContainer) {
    if (tabContainer.__tabs) return;

    this.#tabContainer = tabContainer;
    this.#tabHeads = this.#tabContainer.querySelectorAll('*[data-tab-id]');

    const allContainers = document.querySelectorAll(HEADING_SELECTOR);
    const groupIndex = [...allContainers].indexOf(this.#tabContainer);
    this.#storageKey = `sdrzm-tab:${globalThis.location.pathname}:${groupIndex}`;

    // Store reference on both the container and each tab heading.
    this.#tabContainer.__tabs = this;
    this.#tabHeads.forEach(head => {
      head.__tabs = this;
    });

    this.#setupARIA();
    this.#initialize();
    this.#bindEvents();
  }

  // --- Public API ---

  /**
   * Activates the specified tab. Deactivates the previously active tab.
   * Updates the URL hash if configured.
   * @param {Element} targetTabHead - The tab heading element to activate.
   */
  activateTab = (targetTabHead) => {
    if (!targetTabHead || targetTabHead === this.#activeTabHead) return;

    if (this.#activeTabHead) {
      this.#activeTabHead.classList.remove('is-active');
      this.#activeTabHead.setAttribute('aria-selected', 'false');
      this.#activeTabHead.setAttribute('tabindex', '-1');
      const oldTabPanel = document.getElementById(this.#activeTabHead.getAttribute('data-tab-id'));
      if (oldTabPanel) oldTabPanel.classList.remove('is-active');
    }

    targetTabHead.classList.add('is-active');
    targetTabHead.setAttribute('aria-selected', 'true');
    targetTabHead.setAttribute('tabindex', '0');
    const newTabPanel = document.getElementById(targetTabHead.getAttribute('data-tab-id'));
    if (newTabPanel) newTabPanel.classList.add('is-active');

    this.#activeTabHead = targetTabHead;
    globalThis.sessionStorage.setItem(this.#storageKey, targetTabHead.getAttribute('data-tab-id'));

    const hash = targetTabHead.getAttribute('data-tab-hash');
    if (hash && targetTabHead !== this.#tabHeads[0]) {
      const url = globalThis.location.pathname + globalThis.location.search + `#${hash}`;
      globalThis.history.replaceState(null, null, url);
    } else if (globalThis.location.hash) {
      globalThis.history.replaceState(null, null, globalThis.location.pathname + globalThis.location.search);
    }
  };

  /**
   * Destroys the Tabs instance. Removes event listeners and references.
   */
  destroy = () => {
    this.#tabHeads.forEach(head => {
      const handler = this.#clickHandlers.get(head);
      if (handler) head.removeEventListener('click', handler);
      head.classList.remove('is-active');
      head.removeAttribute('role');
      head.removeAttribute('aria-selected');
      head.removeAttribute('aria-controls');
      head.removeAttribute('tabindex');

      const panel = document.getElementById(head.getAttribute('data-tab-id'));
      if (panel) {
        panel.classList.remove('is-active');
        panel.removeAttribute('role');
        panel.removeAttribute('aria-labelledby');
      }

      head.__tabs = null;
    });
    this.#clickHandlers.clear();
    this.#tabContainer.removeEventListener('keydown', this.#handleKeydown);
    this.#tabContainer.removeAttribute('role');
    this.#tabContainer.__tabs = null;
  };

  // --- Private Helper Methods ---

  #setupARIA = () => {
    this.#tabContainer.setAttribute('role', 'tablist');

    this.#tabHeads.forEach(head => {
      const panelId = head.getAttribute('data-tab-id');
      const headId = head.id || `${panelId}-head`;

      head.setAttribute('role', 'tab');
      if (!head.id) head.id = headId;
      head.setAttribute('aria-controls', panelId);
      head.setAttribute('aria-selected', 'false');
      head.setAttribute('tabindex', '-1');

      const panel = document.getElementById(panelId);
      if (panel) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', headId);
      }
    });
  };

  #initialize = () => {
    this.#tabHeads.forEach(head => {
      const panel = document.getElementById(head.getAttribute('data-tab-id'));
      if (!panel) {
        console.warn(`Tab content not found: #${head.getAttribute('data-tab-id')}`);
      }
    });

    this.activateTab(this.#determineInitialTab());

    if (this.#hashTargetElement) {
      globalThis.setTimeout(() => {
        this.#hashTargetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        Elem.flash(this.#hashTargetElement);
      }, 50);
    }
  };

  #bindEvents = () => {
    this.#tabHeads.forEach(head => {
      const handler = (event) => {
        event.preventDefault();
        this.activateTab(head);
      };
      this.#clickHandlers.set(head, handler);
      head.addEventListener('click', handler);
    });

    // Arrow key navigation (WAI-ARIA Tabs pattern)
    this.#tabContainer.addEventListener('keydown', this.#handleKeydown);
  };

  #handleKeydown = (event) => {
    const heads = [...this.#tabHeads];
    const currentIndex = heads.indexOf(this.#activeTabHead);
    if (currentIndex === -1) return;

    let nextIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % heads.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + heads.length) % heads.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      nextIndex = heads.length - 1;
    } else {
      return;
    }

    this.activateTab(heads[nextIndex]);
    heads[nextIndex].focus();
  };

  #determineInitialTab = () => {
    if (globalThis.location.hash) {
      const hashValue = globalThis.location.hash.substring(1);

      // 1. Hash, bir tab'ın data-tab-hash değeriyle eşleşiyor mu?
      for (const head of this.#tabHeads) {
        if (head.getAttribute('data-tab-hash') === hashValue) return head;
      }

      // 2. Hash bir element ID'si mi ve bu element bir tab panelinin içinde mi?
      const targetElement = document.getElementById(hashValue);
      if (targetElement) {
        for (const head of this.#tabHeads) {
          const panel = document.getElementById(head.getAttribute('data-tab-id'));
          if (panel && panel.contains(targetElement)) {
            this.#hashTargetElement = targetElement;

            return head;
          }
        }
      }
    }

    // 3. sessionStorage'da kayıtlı tab var mı?
    const storedTabId = globalThis.sessionStorage.getItem(this.#storageKey);
    if (storedTabId) {
      const storedTab = this.#tabContainer.querySelector(`*[data-tab-id="${storedTabId}"]`);
      if (storedTab) return storedTab;
    }

    // 4. is-default işaretli tab var mı?
    const defaultTab = this.#tabContainer.querySelector('.is-default');
    if (defaultTab) return defaultTab;

    return this.#tabHeads[0];
  };
}

export default Tabs;
