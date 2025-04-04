import Ajax from '../services/ajax.js';

/**
 * @summary Infinite scroll manager that loads content via AJAX when near the bottom.
 */
class InfiniteScroll {
  // --- Private Instance Fields ---
  #scrollElement;
  #listElement;
  #source;
  #page;
  #setInnerItem;
  #loadingElement;
  #isLoading = false;
  #isFinished = false;
  #throttleTimer = null;

  // --- Static Config ---
  static throttleTime = 200; // Throttle delay for scroll events (ms)
  static launchDistance = 20;  // Trigger distance from bottom (px)

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['scrollElement', 'Element to listen for scroll events (e.g. window or a div). Required.'],
      ['listElement', 'List element where new items are appended (e.g. <ul>). Required.'],
      ['source', 'AJAX endpoint URL for fetching new data. Required.'],
      ['startPage', 'Starting page number. Default: `1`.'],
      ['setInnerItem', 'Function that returns a list element (e.g. <li>) for each data item. Required.']
    ]);
    const availableMethods = new Map([
      ['instance.reCalculate()', 'Rechecks scroll position (after new content is added).'],
      ['instance.pause()', 'Pauses scroll listening.'],
      ['instance.resume()', 'Resumes scroll listening.'],
      ['instance.destroy()', 'Destroys the instance, removes spinner, and clears timer.']
    ]);
    console.info('%cInfiniteScroll', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%cConfig:', 'font-size: 14px; font-weight: bold; color: blue');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cAPI:', 'font-size: 14px; font-weight: bold; color: blue');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  constructor ({ scrollElement = null, listElement = null, source = null, startPage = 1, setInnerItem = () => {} }) {
    if (!scrollElement || !listElement || !source) {
      throw new Error('InfiniteScroll: Missing required parameter (scrollElement, listElement, or source).');
    }

    this.#scrollElement = scrollElement;
    this.#listElement = listElement;
    this.#source = source;
    this.#page = startPage;
    this.#setInnerItem = setInnerItem;

    this.#listElement.__infiniteScroll = this;

    this.#createSpinner();
    this.resume(); // Start event listeners
    this.#handleScroll(); // Initial check in case content doesn't fill the viewport
  }

  // --- Private Event Handlers ---

  #handleScroll = () => {
    // Throttle: prevent scroll events from firing too frequently
    if (this.#throttleTimer) return;

    this.#throttleTimer = globalThis.setTimeout(() => {
      if (!this.#isLoading && !this.#isFinished && this.#isNearBottom()) {
        this.#fetchNextPage();
      }
      this.#throttleTimer = null;
    }, InfiniteScroll.throttleTime);
  };

  // --- Core Logic ---

  #fetchNextPage = async () => {
    this.#isLoading = true;
    this.#showSpinner();

    try {
      const data = await this.#fetchData();
      this.#appendItems(data);

      const last = Number(data.last);
      const limit = Number(data.limit);

      if (data.items.length === 0 || (limit > 0 && last >= limit)) {
        this.#isFinished = true;
        this.pause(); // Stop all listeners
        this.#destroySpinner();
      }
    } catch (error) {
      console.error('InfiniteScroll: Data loading failed.', error);
      this.#isFinished = true; // Stop retrying on error
      this.pause();
    } finally {
      this.#isLoading = false;
      this.#hideSpinner();
      
      // If still near the bottom after adding content, check again.
      // Handles the case where added content doesn't fill the viewport.
      globalThis.requestAnimationFrame(() => this.#handleScroll());
    }
  };

  #fetchData = () => {
    return new Promise((resolve, reject) => {
      Ajax.send({
        success: (xhttp) => {
          try {
            resolve(JSON.parse(xhttp.responseText));
          } catch (e) {
            reject(new Error('JSON parse error'));
          }
        },
        error: (xhttp, status, error) => reject(new Error(`AJAX error: ${status} ${error}`)),
        route: this.#source,
        data: { page: this.#page }
      });
    });
  };

  // --- Helper Methods ---

  #isNearBottom = () => {
    const scrollElementBottom = this.#scrollElement === globalThis? globalThis.innerHeight: this.#scrollElement.getBoundingClientRect().bottom;

    const listElementBottom = this.#listElement.getBoundingClientRect().bottom;

    return listElementBottom - scrollElementBottom < InfiniteScroll.launchDistance;
  };
  
  #appendItems = (data) => {
    if (!data.items || data.items.length === 0) return;

    const fragment = document.createDocumentFragment();
    for (const item of data.items) {
      const li = this.#setInnerItem(item);
      if (li) fragment.appendChild(li);
    }
    this.#listElement.appendChild(fragment);

    this.#page++;
  };

  #createSpinner = () => {
    this.#loadingElement = document.createElement('div');
    this.#loadingElement.className = 'spinner spinner--block';
    this.#listElement.parentNode.appendChild(this.#loadingElement);
  };
  
  #showSpinner = () => {
    if(this.#loadingElement) this.#loadingElement.classList.add('is-loading');
  };

  #hideSpinner = () => {
    if(this.#loadingElement) this.#loadingElement.classList.remove('is-loading');
  };
  
  #destroySpinner = () => {
    this.#loadingElement?.remove();
    this.#loadingElement = null;
  };

  // --- Public API ---

  /**
   * Rechecks scroll position. Used after adding content to verify it fills the viewport.
   */
  reCalculate = () => {
    this.#handleScroll();
  };

  /**
   * Pauses scroll listening. No new requests will be triggered.
   */
  pause = () => {
    this.#scrollElement.removeEventListener('scroll', this.#handleScroll);
    this.#scrollElement.removeEventListener('touchmove', this.#handleScroll);
  };

  /**
   * Resumes scroll listening. Previous listeners are removed and re-attached.
   */
  resume = () => {
    this.pause();
    this.#scrollElement.addEventListener('scroll', this.#handleScroll);
    this.#scrollElement.addEventListener('touchmove', this.#handleScroll);
  };

  /**
   * Destroys the instance. Removes spinner, listeners, and clears the timer.
   */
  destroy = () => {
    this.pause();
    this.#destroySpinner();
    globalThis.clearTimeout(this.#throttleTimer);
    if (this.#listElement) this.#listElement.__infiniteScroll = null;
  };
}

export default InfiniteScroll;

