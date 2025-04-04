/**
 * @summary Auto-height manager for textarea elements based on content.
 */
class AutosizeTextarea {
  // --- Private Static Fields ---
  // Stores the instance created for each textarea element.
  static #instances = new WeakMap();

  // --- Static Config ---
  static help () {
    const availableConfigs = new Map([
      ['listen(selector?)', 'Starts auto-height for all textareas matching the selector. Default: `textarea[data-autosize]`.'],
      ['update(element | elements)', 'Manually updates the height of one or more textareas.'],
      ['destroy(element | elements)', 'Removes auto-height from one or more textareas and restores original styles.']
    ]);
    console.info('%cAutosizeTextarea', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Initializes auto-height for all textareas matching the given selector.
   * @param {string} [selector='textarea[data-autosize]'] - CSS selector to target textarea elements.
   */
  static listen (selector = 'textarea[data-autosize]') {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (!this.#instances.has(element)) {
        this.#instances.set(element, new this(element));
      }
    });
  }

  /**
   * Manually updates the height of one or more textareas.
   * @param {HTMLElement|NodeList} elements - Element(s) to update.
   */
  static update (elements) {
    const toUpdate = elements.length ? elements : [elements];
    toUpdate.forEach(element => this.#instances.get(element)?.update());
  }

  /**
   * Removes auto-height behavior from one or more textareas.
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
  #textarea;
  #heightOffset = null;
  #clientWidth = null;
  #cachedHeight = null;
  #originalStyles = {};

  constructor (textarea) {
    if (textarea?.nodeName !== 'TEXTAREA') {
      throw new Error('AutosizeTextarea: Invalid element. Only <textarea> elements are supported.');
    }
    this.#textarea = textarea;
    this.#initialize();
  }

  // --- Public API ---
  update = () => {
    this.#resize();
    
    const style = globalThis.getComputedStyle(this.#textarea, null);
    const styleHeight = Math.round(parseFloat(style.height));
    const actualHeight = style.boxSizing === 'content-box'? Math.round(parseFloat(style.height)): this.#textarea.offsetHeight;

    if (actualHeight < styleHeight && style.overflowY !== 'scroll') {
      this.#changeOverflow('scroll');
      this.#resize();
    } else if (actualHeight >= styleHeight && style.overflowY !== 'hidden') {
      this.#changeOverflow('hidden');
      this.#resize();
    }

    if (this.#cachedHeight !== actualHeight) {
      this.#cachedHeight = actualHeight;
      const event = new globalThis.Event('autosize:resized', { bubbles: true });
      this.#textarea.dispatchEvent(event);
    }
  };

  destroy = () => {
    this.#unbindEvents();
    Object.keys(this.#originalStyles).forEach(key => {
      this.#textarea.style[key] = this.#originalStyles[key];
    });
  };

  // --- Private Helper Methods ---
  #initialize = () => {
    const style = globalThis.getComputedStyle(this.#textarea, null);

    this.#originalStyles = {
      height: this.#textarea.style.height,
      resize: this.#textarea.style.resize,
      overflowY: this.#textarea.style.overflowY,
      overflowX: this.#textarea.style.overflowX,
      wordWrap: this.#textarea.style.wordWrap,
    };

    if (style.resize === 'vertical') this.#textarea.style.resize = 'none';
    else if (style.resize === 'both') this.#textarea.style.resize = 'horizontal';

    this.#heightOffset = style.boxSizing === 'content-box'? -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)): parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    
    if (isNaN(this.#heightOffset)) this.#heightOffset = 0;
    
    this.#textarea.style.overflowX = 'hidden';
    this.#textarea.style.wordWrap = 'break-word';

    this.#bindEvents();
    this.update();
  };

  #bindEvents = () => {
    window.addEventListener('resize', this.#handleResize);
    this.#textarea.addEventListener('input', this.#handleInput);
    this.#textarea.addEventListener('autosize:update', this.#handleInput);
    this.#textarea.addEventListener('autosize:destroy', this.destroy);
  };
  
  #unbindEvents = () => {
    window.removeEventListener('resize', this.#handleResize);
    this.#textarea.removeEventListener('input', this.#handleInput);
    this.#textarea.removeEventListener('autosize:update', this.#handleInput);
    this.#textarea.removeEventListener('autosize:destroy', this.destroy);
  };

  #handleInput = () => this.update();
  
  #handleResize = () => {
    if (this.#textarea.clientWidth !== this.#clientWidth) {
      this.update();
    }
  };

  #resize = () => {
    if (this.#textarea.scrollHeight === 0) return;

    const parentScrolls = this.#getParentScrolls();
    
    this.#textarea.style.height = ''; // Reset height so scrollHeight is calculated correctly
    this.#textarea.style.height = `${this.#textarea.scrollHeight + this.#heightOffset}px`;
    this.#clientWidth = this.#textarea.clientWidth;

    // Preserve parent elements' scroll positions to prevent jumping
    parentScrolls.forEach(item => {
      item.node.scrollTop = item.scrollTop;
    });
  };

  #getParentScrolls = () => {
    const scrolls = [];
    let parent = this.#textarea.parentNode;
    while (parent && parent instanceof globalThis.Element) {
      if (parent.scrollTop) {
        scrolls.push({ node: parent, scrollTop: parent.scrollTop });
      }
      parent = parent.parentNode;
    }
    
    return scrolls;
  };
  
  #changeOverflow = (value) => {
    // Reflow trick to force text re-wrapping in Chrome/Safari
    const width = this.#textarea.style.width;
    this.#textarea.style.width = '0px';
     
    this.#textarea.offsetWidth;
    this.#textarea.style.width = width;
    this.#textarea.style.overflowY = value;
  };
}

export default AutosizeTextarea;
