import Snackbar from '../modules/snackbar.js';
import Language from '../language/core/language.js';
import Elem from '../modules/elem.js';

/**
 * @summary Static document helpers for navigation, clipboard, unique ID generation, and layout adjustments.
 */
class Document {
  // Kayıtlı fixed element selector'ları. Birden fazla fixed element olduğunda
  // en yüksek z-index'li olanın yüksekliği footer padding'i belirler.
  static #fixedSelectors = new Set();
  static #fixedRafId = null;

  static help () {
    const availableConfigs = new Map([
      ['redirect(url, time?)', 'Redirects to the specified URL with a delay, or refreshes the page.'],
      ['navigateBack(fallbackUrl)', 'Goes back to the previous page via history.back(). If the user came from an external site or opened the page directly, navigates to the fallback URL instead.'],
      ['copyInputText(button)', 'Copies the target input text to clipboard when a button is clicked.'],
      ['uniqueId()', 'Generates a cryptographically secure unique ID (UUID v4).'],
      ['fixedElementAdjust(selector)', 'Registers a fixed element and adjusts footer padding-bottom. When multiple fixed elements overlap, the one with the highest z-index determines the padding.']
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
   * Güvenli geri navigasyon.
   * 1) Referrer same-origin ise → history.back() (döngü yok, dış siteye çıkmaz)
   * 2) Referrer yoksa veya dış site ise → fallback URL'e git
   * @param {string} fallbackUrl - Güvenli geri dönüş yoksa gidilecek URL.
   */
  static navigateBack (fallbackUrl) {
    try {
      const referrerHost = new globalThis.URL(globalThis.document.referrer).hostname;

      if (referrerHost === globalThis.location.hostname) {
        globalThis.history.back();

        return;
      }
    } catch {
      // Referrer boş veya geçersiz — fallback'e düş
    }

    globalThis.location.href = fallbackUrl;
  }

  /**
   * Copies the target input text to clipboard when the button is clicked.
   * @param {HTMLElement} button - Button element with `data-target-input-id` attribute.
   */
  static copyInputText (button) {
    const targetId = button.getAttribute('data-target-input-id');
    const elem = document.getElementById(targetId);

    if (!elem) {
      console.error('[Sadrazam|Document] copyInputText target element not found.', targetId);

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

  /**
   * Registers a fixed element and adjusts footer padding to prevent content from being hidden.
   * When multiple fixed elements are registered, the one with the highest computed z-index
   * determines the padding — lower z-index elements are visually behind it and don't contribute.
   *
   * @param {string} selector - CSS selector for the fixed element.
   */
  static fixedElementAdjust (selector) {
    this.#fixedSelectors.add(selector);

    // Aynı frame'deki çağrıları birleştir — tüm register'lar tamamlandıktan sonra tek hesaplama
    globalThis.cancelAnimationFrame(this.#fixedRafId);
    this.#fixedRafId = globalThis.requestAnimationFrame(() => this.#applyFixedAdjust());
  }

  static #applyFixedAdjust () {
    const footer = globalThis.document.querySelector('footer');
    if (!footer) {
      return;
    }

    // Önceki çağrıdan kalan state'i temizle — her şeyi doğal haline döndür
    for (const sel of this.#fixedSelectors) {
      const el = globalThis.document.querySelector(sel);
      if (el && el.hasAttribute('data-original-display')) {
        el.style.display = el.getAttribute('data-original-display') || '';
        el.removeAttribute('data-original-display');
      }
    }

    if (footer.hasAttribute('data-default-padding-bottom')) {
      footer.style.paddingBottom = footer.getAttribute('data-default-padding-bottom');
      footer.removeAttribute('data-default-padding-bottom');
    }

    // Tüm kayıtlı selector'lar arasında visible + fixed olanları bul
    let winner = null;
    let winnerZIndex = -Infinity;
    const candidates = [];

    for (const sel of this.#fixedSelectors) {
      const el = globalThis.document.querySelector(sel);
      if (!el) {
        continue;
      }

      const style = globalThis.getComputedStyle(el);
      if (style.display === 'none' || style.position !== 'fixed') {
        continue;
      }

      const zIndex = parseInt(style.zIndex, 10) || 0;
      candidates.push({ el, zIndex });

      if (zIndex > winnerZIndex) {
        winnerZIndex = zIndex;
        winner = el;
      }
    }

    // Hiçbir fixed element yoksa — reset zaten yapıldı, çık
    if (!winner) {
      return;
    }

    // Kaybedenleri gizle — orijinal display'i sakla
    for (const { el, zIndex } of candidates) {
      if (zIndex < winnerZIndex) {
        el.setAttribute('data-original-display', el.style.display);
        el.style.display = 'none';
      }
    }

    if (!footer.hasAttribute('data-default-padding-bottom')) {
      footer.setAttribute('data-default-padding-bottom', Elem.getStyle(footer, 'padding-bottom'));
    }

    const winnerHeight = parseFloat(Elem.getStyle(winner, 'height'));
    const originalPadding = parseFloat(footer.getAttribute('data-default-padding-bottom'));

    footer.style.paddingBottom = `${winnerHeight + originalPadding}px`;
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
          console.error(`[Sadrazam|InsertScript] Failed to load ${oldScript.src}`);
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
  
}


export { InsertScript, Document as default };

