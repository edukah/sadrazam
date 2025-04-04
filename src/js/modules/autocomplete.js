import Ajax from '../services/ajax.js';

/**
* @summary Autocomplete input component with keyboard navigation, caching, and badge support.
* @description Provides search-as-you-type suggestions from a remote endpoint,
* with debounce, ARIA attributes, and configurable callbacks.
*/
class Autocomplete {
  // --- Private Class Fields ---
  #config;
  #searchTermInput;
  #suggestionContainer;
  #cache = {};
  #lastValue = '';
  #debounceTimer = null;
  #selectedItem = null;
  #originalAutocompleteAttr;
  #badgeElement = null;
  #badgeConfig = null;

  // --- Static Config ---
  static defaultConfig = {
    selector: null,
    source: null,
    delay: 250,
    cache: false,
    minChars: 1,
    badge: null,
    menuClass: 'tbc-grey-zero',
    onSelect: function (event, itemValue, item) {
      globalThis.setTimeout(function () {
        const targetUrl = item.firstElementChild?.getAttribute('data-href');
        if (targetUrl) {
          globalThis.location.href = targetUrl;
        }
        if (item.onclick && (event.key === 'Enter' || event.type === 'mouseup')) {
          item.onclick();
        }
      }, 40);
    }
  };

  /**
   * Returns the Autocomplete instance attached to the given input element.
   * @param {Element} element - The autocomplete input element.
   * @returns {Autocomplete|undefined} The Autocomplete instance or undefined.
   */
  static getInstance (element) {
    return element?.__autocomplete;
  }

  /**
   * Prints available configuration options and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['selector', 'Target input element. CSS selector string or DOM Element reference.'],
      ['source', 'Endpoint URL for the search query. String. Required.'],
      ['delay', 'Debounce delay in ms after last keystroke. Default: `250`.'],
      ['cache', 'Cache results for repeated queries? Boolean. Default: `false`.'],
      ['minChars', 'Minimum characters before search is triggered. Integer. Default: `1`.'],
      ['badge', 'Badge template shown in input after selection. Format: "#{field_name}". Optional.'],
      ['menuClass', 'CSS class appended to the suggestions container. String.'],
      ['onSelect', 'Callback fired when a suggestion is selected. Receives (event, value, item).']
    ]);
    const availableMethods = new Map([
      ['Autocomplete.getInstance(element)', 'Returns the Autocomplete instance attached to the given input element.'],
      ['instance.setBadge(value)', 'Shows the badge with the given value (formatted via badge template).'],
      ['instance.clearBadge()', 'Hides the badge and resets input padding.'],
      ['instance.destroy()', 'Destroys the instance, removes listeners and cleans up DOM.']
    ]);
    const usageGuide = [
      'Server endpoint should return <ul> with <li class="autocomplete__suggestion"> items.',
      'Add `data-autocomplete-disabled` attribute to <li> for non-selectable items.',
      'CSS states: `.is-open` (dropdown visible), `.is-selected` (keyboard/mouse highlighted item).',
      'Hover effect only active on devices with fine pointer (hover media query).',
      'Dark mode supported (stronger shadow, adaptive colors).'
    ];
    console.info('%cAutocomplete', 'font-size: 20px; font-weight: bold; color: red');
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

  constructor (userConfig) {
    this.#config = { ...Autocomplete.defaultConfig, ...userConfig };

    if (!this.#initializeQueryInput()) return;
    if (!this.#config.source) {
      throw new Error('Autocomplete: `source` is a required parameter.');
    }

    this.#originalAutocompleteAttr = this.#searchTermInput.getAttribute('autocomplete');

    if (this.#config.badge) {
      this.#badgeConfig = this.#parseBadgeConfig();
    }

    this.#setupDOM();
    this.#bindEvents();
  }

  // --- Event Handlers ---
  #keydownHandler = (event) => {
    if (!this.#suggestionContainer.classList.contains('is-open')) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.#handleArrowKeys(event.key);
        break;
      case 'Escape':
        event.preventDefault();
        this.#hideSuggestions();
        break;
      case 'Enter':
      case 'Tab':
        this.#handleEnterKey(event);
        break;
    }
  };

  #keyupHandler = (event) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape', 'Tab'].includes(event.key)) return;
    this.#triggerSearchWithDelay();
  };

  #focusHandler = () => {
    this.#lastValue = '\n';
    this.#triggerSearchWithDelay();
  };

  #blurHandler = () => {
    globalThis.setTimeout(() => {
      if (!this.#suggestionContainer.matches(':hover')) {
        this.#hideSuggestions();
      }
    }, 150);
  };

  #mouseupHandler = (event, item) => {
    if (item.hasAttribute('data-autocomplete-disabled')) return;

    const value = item.getAttribute('data-autocomplete-value');

    if (value === null) {
      console.warn('Autocomplete: Suggestion missing "data-autocomplete-value" attribute.', item);
      
      return;
    }

    this.#config.onSelect(event, value, item);
    this.#updateBadgeFromItem(item);
    this.#hideSuggestions();
  };

  #mouseoverHandler = (event, item) => {
    if (item.hasAttribute('data-autocomplete-disabled')) return;

    const previouslySelectedItem = this.#suggestionContainer.querySelector('.is-selected');
    if (previouslySelectedItem) {
      previouslySelectedItem.classList.remove('is-selected');
      previouslySelectedItem.setAttribute('aria-selected', 'false');
    }
    item.classList.add('is-selected');
    item.setAttribute('aria-selected', 'true');
    if (item.id) {
      this.#searchTermInput.setAttribute('aria-activedescendant', item.id);
    }
  };

  #mouseleaveHandler = () => {
    const currentlySelectedItem = this.#suggestionContainer.querySelector('.is-selected');
    if (currentlySelectedItem) {
      currentlySelectedItem.classList.remove('is-selected');
      currentlySelectedItem.setAttribute('aria-selected', 'false');
    }
    this.#searchTermInput.removeAttribute('aria-activedescendant');
  };

  // --- Core Logic ---
  #triggerSearchWithDelay = () => {
    globalThis.clearTimeout(this.#debounceTimer);
    if (this.#searchTermInput.value.length < this.#config.minChars) {
      this.#hideSuggestions();
      
      return;
    }
    this.#debounceTimer = globalThis.setTimeout(() => {
      this.#performSearch();
    }, this.#config.delay);
  };

  #performSearch = async () => {
    const searchTerm = this.#searchTermInput.value;
    if (searchTerm === this.#lastValue) return;
    this.#lastValue = searchTerm;

    if (this.#config.cache && this.#cache[searchTerm]) {
      this.#renderSuggestions(this.#cache[searchTerm]);
      
      return;
    }

    try {
      const data = await this.#fetchSuggestions(searchTerm);
      if (this.#config.cache) {
        this.#cache[searchTerm] = data;
      }
      this.#renderSuggestions(data);
    } catch (error) {
      console.error('Autocomplete request failed:', error);
      this.#hideSuggestions();
    }
  };

  #fetchSuggestions = (searchTerm) => {
    return new Promise((resolve, reject) => {
      Ajax.send({
        success: (xhttp) => {
          try {
            const responseData = JSON.parse(xhttp.responseText);
            resolve(responseData.html || responseData);
          } catch (e) {
            if (typeof xhttp.responseText === 'string') {
              resolve(xhttp.responseText);
            } else {
              console.warn('Autocomplete: Invalid server response (not JSON or text).', xhttp.responseText);
              reject(new Error('Invalid server response'));
            }
          }
        },
        error: (xhttp, status, error) => reject(new Error(`AJAX Error: ${status} ${error}`)),
        route: this.#config.source,
        data: { search_term: searchTerm }
      });
    });
  };

  // --- Helper Methods ---
  #handleArrowKeys = (key) => {
    const items = [...this.#suggestionContainer.firstElementChild.children].filter(
      item => !item.hasAttribute('data-autocomplete-disabled')
    );
    if (!items.length) return;

    const currentItem = this.#suggestionContainer.querySelector('.is-selected');
    const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

    let nextIndex;
    if (currentIndex === -1) {
      nextIndex = (key === 'ArrowDown') ? 0 : items.length - 1;
    } else {
      nextIndex = (key === 'ArrowDown') ? currentIndex + 1 : currentIndex - 1;
    }

    this.#updateSelection(nextIndex, { items });
  };

  #handleEnterKey = (event) => {
    const currentSelection = this.#suggestionContainer.querySelector('.is-selected');
    if (currentSelection && this.#suggestionContainer.classList.contains('is-open')) {
      event.preventDefault();
      this.#mouseupHandler(event, currentSelection); // Reuse click handler logic
    }
  };

  #renderSuggestions = (data) => {
    if (!data || typeof data !== 'string' || data.trim() === '') {
      this.#hideSuggestions();

      return;
    }

    this.#suggestionContainer.innerHTML = data;
    this.#selectedItem = null;

    if (!this.#suggestionContainer.querySelector('.autocomplete__suggestion')) {
      console.warn('Autocomplete: No ".autocomplete__suggestion" elements found in response.');
    }

    // Add ARIA attributes to server-rendered items (if not in template)
    const suggestions = this.#suggestionContainer.querySelectorAll('.autocomplete__suggestion');
    suggestions.forEach((item, index) => {
      if (!item.getAttribute('role')) item.setAttribute('role', 'option');
      if (!item.id) item.id = `${this.#suggestionContainer.id}-option-${index}`;
    });

    const hasVisibleContent = this.#suggestionContainer.textContent?.trim().length > 0;
    if (hasVisibleContent && this.#searchTermInput === document.activeElement) {
      this.#suggestionContainer.classList.add('is-open');
      this.#searchTermInput.setAttribute('aria-expanded', 'true');
    } else {
      this.#hideSuggestions();
    }
  };

  #updateSelection = (index, { items }) => {
    const previouslySelectedItem = this.#suggestionContainer.querySelector('.is-selected');
    if (previouslySelectedItem) {
      previouslySelectedItem.classList.remove('is-selected');
      previouslySelectedItem.setAttribute('aria-selected', 'false');
    }

    if (index >= 0 && index < items.length) {
      this.#selectedItem = items[index];
      this.#selectedItem.classList.add('is-selected');
      this.#selectedItem.setAttribute('aria-selected', 'true');
      this.#selectedItem.scrollIntoView({ block: 'nearest' });

      // Announce selected item to screen readers via aria-activedescendant
      if (this.#selectedItem.id) {
        this.#searchTermInput.setAttribute('aria-activedescendant', this.#selectedItem.id);
      }

      const value = this.#selectedItem.getAttribute('data-autocomplete-value');

      if (value === null) {
        console.warn('Autocomplete: Selected suggestion missing "data-autocomplete-value". Input not updated.', this.#selectedItem);
        this.#searchTermInput.value = this.#lastValue; // Restore input to previous value

        return;
      }

      this.#searchTermInput.value = value;
    } else {
      this.#selectedItem = null;
      this.#searchTermInput.value = this.#lastValue;
      this.#searchTermInput.removeAttribute('aria-activedescendant');
    }
  };

  // --- Badge Methods ---
  #parseBadgeConfig = () => {
    const match = this.#config.badge.match(/\{(.+?)\}/);
    if (!match) {
      console.warn('Autocomplete: Invalid badge format — missing {field_name} placeholder.');

      return null;
    }

    return { field: match[1], format: this.#config.badge };
  };

  #setupBadge = () => {
    const parent = this.#searchTermInput.parentElement;
    parent.classList.add('autocomplete__badge-container');

    this.#badgeElement = globalThis.document.createElement('span');
    this.#badgeElement.className = 'autocomplete__badge';
    this.#badgeElement.style.display = 'none';
    parent.appendChild(this.#badgeElement);
  };

  #badgeInputHandler = () => {
    if (this.#badgeElement && this.#badgeElement.style.display !== 'none') {
      this.clearBadge();
    }
  };

  #updateBadgeFromItem = (item) => {
    if (!this.#badgeConfig) return;

    const hiddenInput = item.querySelector(`input[name="${this.#badgeConfig.field}"]`);
    if (!hiddenInput) {
      console.warn(`Autocomplete: Badge field "${this.#badgeConfig.field}" not found in selected suggestion.`);

      return;
    }

    this.setBadge(hiddenInput.value);
  };

  /**
   * Shows the badge with the given value, formatted via the badge template.
   * @param {string|number} value - The raw value to display in the badge.
   */
  setBadge = (value) => {
    if (!this.#badgeElement || !this.#badgeConfig) return;

    const text = this.#badgeConfig.format.replace(`{${this.#badgeConfig.field}}`, value);
    this.#badgeElement.textContent = text;
    this.#badgeElement.style.display = '';

    const badgeWidth = this.#badgeElement.offsetWidth;
    this.#searchTermInput.style.paddingRight = `${badgeWidth + 16}px`;
  };

  /**
   * Hides the badge and resets input padding.
   */
  clearBadge = () => {
    if (!this.#badgeElement) return;

    this.#badgeElement.style.display = 'none';
    this.#badgeElement.textContent = '';
    this.#searchTermInput.style.paddingRight = '';
  };

  #hideSuggestions = () => {
    this.#lastValue = this.#searchTermInput.value;
    this.#suggestionContainer.classList.remove('is-open');
    this.#searchTermInput.setAttribute('aria-expanded', 'false');
    this.#searchTermInput.removeAttribute('aria-activedescendant');
  };

  #initializeQueryInput = () => {
    if (this.#config.selector instanceof globalThis.Element) {
      this.#searchTermInput = this.#config.selector;
    } else if (typeof this.#config.selector === 'string') {
      this.#searchTermInput = document.querySelector(this.#config.selector);
    }
    if (!this.#searchTermInput) {
      console.warn('Autocomplete: Target element not found.');

      return false;
    }
    this.#searchTermInput.__autocomplete = this;

    return true;
  };

  #setupDOM = () => {
    const listboxId = `autocomplete-listbox-${Date.now()}`;

    this.#searchTermInput.setAttribute('autocomplete', 'off');
    this.#searchTermInput.setAttribute('role', 'combobox');
    this.#searchTermInput.setAttribute('aria-expanded', 'false');
    this.#searchTermInput.setAttribute('aria-autocomplete', 'list');
    this.#searchTermInput.setAttribute('aria-controls', listboxId);

    this.#suggestionContainer = document.createElement('div');
    this.#suggestionContainer.id = listboxId;
    this.#suggestionContainer.className = `autocomplete__suggestions-container ${this.#config.menuClass}`;
    this.#suggestionContainer.setAttribute('role', 'listbox');
    this.#searchTermInput.after(this.#suggestionContainer);

    if (this.#badgeConfig) {
      this.#setupBadge();
    }
  };

  #bindEvents = () => {
    this.#searchTermInput.addEventListener('keydown', this.#keydownHandler);
    this.#searchTermInput.addEventListener('keyup', this.#keyupHandler);
    this.#searchTermInput.addEventListener('blur', this.#blurHandler);
    this.#searchTermInput.addEventListener('focus', this.#focusHandler);

    this.#suggestionContainer.addEventListener('mouseover', (event) => {
      this.#suggestionItemHandler(event, this.#mouseoverHandler);
    });
    this.#suggestionContainer.addEventListener('mouseup', (event) => {
      this.#suggestionItemHandler(event, this.#mouseupHandler);
    });
    this.#suggestionContainer.addEventListener('mouseleave', this.#mouseleaveHandler);

    if (this.#badgeConfig) {
      this.#searchTermInput.addEventListener('input', this.#badgeInputHandler);
    }
  };

  #suggestionItemHandler = (event, callback) => {
    const item = event.target.closest('.autocomplete__suggestion');
    if (item) callback(event, item);
  };

  /**
   * Destroys the instance. Removes listeners, cleans up DOM, and restores
   * the original `autocomplete` attribute.
   */
  destroy = () => {
    this.#searchTermInput.removeEventListener('keydown', this.#keydownHandler);
    this.#searchTermInput.removeEventListener('keyup', this.#keyupHandler);
    this.#searchTermInput.removeEventListener('blur', this.#blurHandler);
    this.#searchTermInput.removeEventListener('focus', this.#focusHandler);

    if (this.#originalAutocompleteAttr) {
      this.#searchTermInput.setAttribute('autocomplete', this.#originalAutocompleteAttr);
    } else {
      this.#searchTermInput.removeAttribute('autocomplete');
    }

    this.#searchTermInput.removeAttribute('role');
    this.#searchTermInput.removeAttribute('aria-expanded');
    this.#searchTermInput.removeAttribute('aria-autocomplete');
    this.#searchTermInput.removeAttribute('aria-controls');
    this.#searchTermInput.removeAttribute('aria-activedescendant');

    if (this.#badgeElement) {
      this.#searchTermInput.removeEventListener('input', this.#badgeInputHandler);
      this.#searchTermInput.parentElement.classList.remove('autocomplete__badge-container');
      this.#badgeElement.remove();
      this.#searchTermInput.style.paddingRight = '';
    }

    this.#suggestionContainer.remove();
    this.#searchTermInput.__autocomplete = null;
  };
}

export default Autocomplete;
