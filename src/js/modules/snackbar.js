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

    // If message is a string, normalize it to object format.
    // The fallback type MUST be one that _snackbar.scss defines a modifier for
    // (error / warning / notice / success / hint) — the type is interpolated straight into
    // `snackbar__static-container--${type}` in #createMessageGroup(). An unstyled type still
    // renders, but with no icon, no colour and no border: it silently looks broken.
    // 'notice' is the neutral informational type; Toast falls back to 'hint' for the same reason.
    const messageGroups = typeof message === 'string' ? { notice: [message] } : message;

    for (const type of Object.keys(messageGroups)) {
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
    if (this.#timer) globalThis.clearTimeout(this.#timer);
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
    const groupContainer = document.createElement('div');
    groupContainer.className = `snackbar__static-container snackbar__static-container--${type}`;

    const ul = document.createElement('ul');
    ul.className = 'snackbar__static-list';
    // Mesaj TEK bir <div> ile sarılır: <li> bir flex container (madde işareti + mesaj bloğu).
    // Sarılmazsa mesajdaki metin düğümleri ile inline HTML (<a>, <strong>) ayrı birer flex item
    // olur ve aralarındaki boşluk yutulur ("için giriş yapın" → "içingiriş yapın").
    ul.innerHTML = messages.map(msg => `<li><div>${msg}</div></li>`).join('');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'snackbar__static-close';
    closeButton.innerHTML = '<i class="ph-light ph-x"></i>';
    closeButton.addEventListener('click', this.#handleCloseClick);

    groupContainer.appendChild(ul);
    groupContainer.appendChild(closeButton);

    return groupContainer;
  };
}

export default Snackbar;
