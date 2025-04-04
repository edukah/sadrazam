import Snackbar from '../modules/snackbar.js';
import Language from '../language/core/language.js';

/**
 * @summary Static document helpers for navigation, clipboard, and unique ID generation.
 */
class Document {
  static help () {
    const availableConfigs = new Map([
      ['redirect(url, time?)', 'Redirects to the specified URL with a delay, or refreshes the page.'],
      ['copyInputText(button)', 'Copies the target input text to clipboard when a button is clicked.'],
      ['uniqueId()', 'Generates a cryptographically secure unique ID (UUID v4).']
    ]);
    console.info('%cDocument', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Redirects to the specified URL with a delay, or refreshes the page.
   * @param {string} url - Target URL or 'refresh'.
   * @param {number} [time=1] - Delay in milliseconds.
   */
  static redirect (url, time = 1) {
    const delay = typeof time === 'number' && time >= 0 && time < 9999 ? time : 1;

    globalThis.setTimeout(() => {
      if (!url || url === 'refresh') {
        window.location.reload();
      } else {
        const decodedUrl = decodeURIComponent(url);
        window.location.href = decodedUrl;

        // Reload the page when only the hash changes
        const currentUrlWithoutHash = window.location.href.split('#')[0];
        const targetUrlWithoutHash = decodedUrl.split('#')[0];
        if (decodedUrl.includes('#') && currentUrlWithoutHash === targetUrlWithoutHash) {
          window.location.reload();
        }
      }
    }, delay);
  }

  /**
   * Copies the target input text to clipboard when the button is clicked.
   * @param {HTMLElement} button - Button element with `data-target-input-id` attribute.
   */
  static copyInputText (button) {
    const targetId = button.getAttribute('data-target-input-id');
    const elem = document.getElementById(targetId);

    if (!elem) {
      console.error('Document: copyInputText target element not found.', targetId);

      return;
    }

    const text = elem.value ?? elem.textContent;

    globalThis.navigator.clipboard.writeText(text).then(() => {
      Snackbar.insert({ success: Language.get('clipboardSuccess') });
    }).catch(() => {
      Snackbar.insert({ error: Language.get('clipboardError') });
    });
  }

  /**
   * Generates a cryptographically secure unique ID (UUID v4).
   * @returns {string} Unique ID.
   */
  static uniqueId () {
    return globalThis.crypto.randomUUID();
  }
  
}

/**
 * @summary Executes script tags inside AJAX-loaded HTML content in order.
 */
class InsertScript {
  static #runScriptTypes = [
    'application/javascript', 'application/ecmascript', 'text/javascript', 'text/ecmascript',
    // ...other mime types...
  ];
  
  static help () {
    console.info('%cInsertScript', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%crun(container)', 'font-weight: bold; color: red', 'font-weight: normal; color: unset', 'Executes <script> tags inside the given container in order.');
  }

  /**
   * Finds and executes scripts inside the given container in order.
   * @param {HTMLElement} container - DOM element to search for scripts.
   */
  static async run (container) {
    const scripts = container.querySelectorAll('script');
    if (!scripts.length) return;

    const scriptsToRun = Array.from(scripts).filter(script => {
      const type = script.getAttribute('type');
      
      return !type || this.#runScriptTypes.includes(type);
    });

    for (const script of scriptsToRun) {
      await this.#executeScript(script);
    }

    this.#dispatchDOMContentLoaded();
  }

  /**
   * @private Executes a single script element and waits for it to finish.
   * @param {HTMLScriptElement} oldScript - Original script element to execute.
   * @returns {Promise<void>} Promise that resolves when the script completes.
   */
  static #executeScript (oldScript) {
    return new Promise((resolve) => {
      const newScript = this.#createScriptElement(oldScript);

      if (oldScript.src) {
        newScript.onload = () => resolve();
        newScript.onerror = () => {
          console.error(`InsertScript: Failed to load ${oldScript.src}`);
          resolve(); // Continue running remaining scripts even on error
        };
      }
      
      document.head.appendChild(newScript);
      oldScript.remove(); // Remove the old script

      if (!oldScript.src) {
        resolve(); // Resolve immediately for inline scripts
      }
    });
  }
  
  /**
   * @private Creates a new executable script element.
   */
  static #createScriptElement (sourceScript) {
    const script = document.createElement('script');
    // Copy all attributes
    [...sourceScript.attributes].forEach(attr => {
      script.setAttribute(attr.nodeName, attr.nodeValue);
    });
    script.textContent = sourceScript.textContent;
    
    return script;
  }
  
  /**
   * @private Dispatches a DOMContentLoaded event after all scripts complete.
   */
  static #dispatchDOMContentLoaded () {
    const event = new globalThis.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
    document.dispatchEvent(event);
  }
}


export { InsertScript, Document as default };

