/**
 * @summary Auto-width manager for select elements based on selected option content.
 */
class AutosizeSelect {
  // --- Private Static Fields ---
  static #instances = new WeakMap();

  // --- Static Config ---
  static help () {
    const availableConfigs = new Map([
      ['listen(selector?)', 'Starts auto-width for all selects matching the selector. Default: `select[data-autosize-select]`.'],
      ['update(element | elements)', 'Manually updates the width of one or more selects.'],
      ['destroy(element | elements)', 'Removes auto-width from one or more selects.']
    ]);
    console.info('%cAutosizeSelect', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Initializes auto-width for all selects matching the given selector.
   * @param {string} [selector='select[data-autosize-select]'] - CSS selector to target select elements.
   */
  static listen (selector = 'select[data-autosize-select]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (!this.#instances.has(element)) {
        this.#instances.set(element, new this(element));
      }
    });
  }

  /**
   * Manually updates the width of one or more select elements.
   * @param {HTMLElement|NodeList} elements - Element(s) to update.
   */
  static update (elements) {
    const toUpdate = elements.length ? elements : [elements];
    toUpdate.forEach(element => this.#instances.get(element)?.update());
  }

  /**
   * Removes auto-width behavior from one or more select elements.
   * @param {HTMLElement|NodeList} elements - Element(s) to remove.
   */
  static destroy (elements) {
    const toDestroy = elements.length ? elements : [elements];
    toDestroy.forEach(element => {
      this.#instances.get(element)?.destroy();
      this.#instances.delete(element);
    });
  }

  // --- Private Instance Fields ---
  #selectElement;
  #measurementSpan;

  constructor (selectElement) {
    if (selectElement?.nodeName !== 'SELECT') {
      throw new Error('AutosizeSelect: Invalid element. Only <select> elements are supported.');
    }
    this.#selectElement = selectElement;
    this.#initialize();
  }

  // --- Public API ---
  update = () => {
    if (!this.#selectElement || this.#selectElement.selectedIndex < 0) return;

    const selectedOption = this.#selectElement.options[this.#selectElement.selectedIndex];
    if (!selectedOption) return;
    
    // Update measurement span content with the selected option's text
    this.#measurementSpan.textContent = selectedOption.textContent;

    // Measure the span's width
    const width = this.#measurementSpan.offsetWidth;

    // Add extra space for the dropdown arrow and margins
    const extraPadding = 30; // Adjust this value as needed

    this.#selectElement.style.width = `${width + extraPadding}px`;
  };

  destroy = () => {
    this.#unbindEvents();
    this.#measurementSpan?.remove();
    this.#selectElement.style.width = ''; // Restore original state
  };

  // --- Private Helper Methods ---
  #initialize = () => {
    this.#createMeasurementSpan();
    this.#bindEvents();
    this.update(); // Set initial width based on the selected value
  };

  #bindEvents = () => {
    this.#selectElement.addEventListener('change', this.update);
  };
  
  #unbindEvents = () => {
    this.#selectElement.removeEventListener('change', this.update);
  };

  #createMeasurementSpan = () => {
    this.#measurementSpan = document.createElement('span');
    
    // Make the span invisible but keep it measurable
    this.#measurementSpan.style.visibility = 'hidden';
    this.#measurementSpan.style.position = 'absolute';
    this.#measurementSpan.style.whiteSpace = 'nowrap';
    this.#measurementSpan.style.left = '-9999px';
    
    // Copy the select element's font styles to the span
    const selectStyles = window.getComputedStyle(this.#selectElement);
    this.#measurementSpan.style.fontFamily = selectStyles.fontFamily;
    this.#measurementSpan.style.fontSize = selectStyles.fontSize;
    this.#measurementSpan.style.fontWeight = selectStyles.fontWeight;
    this.#measurementSpan.style.letterSpacing = selectStyles.letterSpacing;
    this.#measurementSpan.style.padding = selectStyles.padding;

    document.body.appendChild(this.#measurementSpan);
  };
}

export default AutosizeSelect;
