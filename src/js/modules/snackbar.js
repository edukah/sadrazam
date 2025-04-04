/**
 * @summary Singleton notification manager for inline and popup alerts.
 * Like a snack bar — horizontal, colorful, pick it up now or save it for later.
 * Covers both static (inline, stays on page) and popup (fixed, auto-dismiss) usage.
 */
class Snackbar {
  // --- Private Static Fields ---
  static #wrapper = null;
  static #timer = null;

  /**
   * Prints available configuration options to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['message', 'Message to display. String or object (e.g. { success: "Done!", error: "Failed." }). Required.'],
      ['time', 'Display duration in ms. Set to `false` to disable auto-dismiss. Default: `5000`.']
    ]);
    console.info('%cSnackbar', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Displays a notification message on screen.
   * @param {string|object} message - Message or message groups to display.
   * @param {number|false} [time=5000] - Auto-dismiss delay in ms.
   */
  static insert (message, time = 5000) {
    // Clear previous notification (ensures only one notification box at a time)
    this.#cleanup();

    if (!message || (typeof message === 'object' && Object.keys(message).length === 0)) {
      return;
    }

    this.#wrapper = this.#createWrapper();

    // If message is a string, normalize it to object format
    const messageGroups = typeof message === 'string' ? { info: [message] } : message;

    for (const type in messageGroups) {
      const messages = Array.isArray(messageGroups[type]) ? messageGroups[type] : [messageGroups[type]];
      const groupElement = this.#createMessageGroup(type, messages);
      this.#wrapper.appendChild(groupElement);
    }

    // If no valid groups were created, abort
    if (!this.#wrapper.children.length) {
      this.#wrapper = null;

      return;
    }

    document.body.appendChild(this.#wrapper);

    if (time !== false && typeof time === 'number') {
      this.#timer = globalThis.setTimeout(() => {
        this.#cleanup();
      }, time);
    }
  }

  /**
   * Handles close button click.
   */
  static #handleCloseClick = (event) => {
    const group = event.target.closest('.snackbar__static-container');
    group?.remove();

    // If no message groups remain, remove the entire wrapper.
    if (this.#wrapper && this.#wrapper.children.length === 0) {
      this.#cleanup();
    }
  };

  /**
   * Removes the notification box and clears the timer.
   */
  static #cleanup = () => {
    if(this.#timer) globalThis.clearTimeout(this.#timer);
    this.#wrapper?.remove();
    this.#wrapper = null;
    this.#timer = null;
  };

  /**
   * Creates the notification wrapper element.
   * @returns {HTMLElement} The created div element.
   */
  static #createWrapper = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'snackbar__popup-wrapper';

    return wrapper;
  };

  /**
   * Creates the HTML element for a single message group.
   * @param {string} type - Message type (e.g. 'success', 'error').
   * @param {string[]} messages - List of messages in this group.
   * @returns {HTMLElement} The created div element.
   */
  static #createMessageGroup = (type, messages) => {
    // Template literals are more readable than createElement for this structure.
    const groupHTML = `
      <ul class="snackbar__static-list">
        ${messages.map(msg => `<li>${msg}</li>`).join('')}
      </ul>
      <button type="button" class="snackbar__static-close">
        <i class="ph-light ph-x"></i>
      </button>
    `;

    const groupContainer = document.createElement('div');
    groupContainer.className = `snackbar__static-container snackbar__static-container--${type}`;
    groupContainer.innerHTML = groupHTML;

    // Attach close button event listener
    const closeButton = groupContainer.querySelector('.snackbar__static-close');
    closeButton?.addEventListener('click', this.#handleCloseClick);

    return groupContainer;
  };
}

export default Snackbar;
