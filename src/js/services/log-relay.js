/**
 * @summary Global JavaScript error capture and backend relay service.
 * @description Collects runtime JS errors, unhandled Promise rejections, and
 * manually reported errors, deduplicates them, and relays to backend.
 *
 * Only errors from same-origin scripts are logged.
 * Cross-origin script errors (3rd party analytics, widgets, etc.) are skipped.
 *
 * Backend endpoint is optional — if not set, only writes to console.
 * Uses `navigator.sendBeacon` for delivery (fire-and-forget, works even if page closes).
 *
 * Usage:
 *   LogRelay.init({ endpoint: '/api/log/js-error' });
 *   LogRelay.capture(error);
 *   LogRelay.capture(error, { component: 'SaleOrderJS', action: 'shipped' });
 */
class LogRelay {
  // Backend endpoint — if null, only writes to console
  static #endpoint = null;

  // Fingerprint set of errors sent in the last N seconds (duplicate prevention)
  static #recentFingerprints = new Map();

  // How many ms before the same error can be sent again
  static #dedupeWindowMs = 10_000;

  // Page context — included in every report
  static #pageContext = null;

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['init(options?)', 'Initializes LogRelay. options: { endpoint, dedupeWindowMs }.'],
      ['capture(error, context?)', 'Manual error report. context: { component, action, ... }.']
    ]);
    console.info('%cLogRelay', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Initializes LogRelay and attaches global listeners.
   *
   * @param {object}  [options]
   * @param {string}  [options.endpoint]          Backend URL (optional)
   * @param {number}  [options.dedupeWindowMs]    Deduplicate window for the same error (ms)
   */
  static init ({ endpoint = null, dedupeWindowMs = 10_000 } = {}) {
    this.#endpoint = endpoint;
    this.#dedupeWindowMs = dedupeWindowMs;

    this.#pageContext = {
      url: globalThis.location?.href,
      origin: globalThis.location?.origin,
      userAgent: globalThis.navigator?.userAgent
    };

    // Runtime JS errors (syntax error, reference error, etc.)
    globalThis.addEventListener('error', (event) => {
      this.#handleWindowError(event);
    });

    // Unhandled Promise rejections (async errors without catch)
    globalThis.addEventListener('unhandledrejection', (event) => {
      this.#handleUnhandledRejection(event);
    });
  }

  /**
   * Manual error report.
   * Called explicitly from code — try/catch blocks, callback errors, etc.
   *
   * @param {Error|string} error    Error object or message string
   * @param {object}       [context] Additional context (component, action, etc.)
   */
  static capture (error, context = {}) {
    const report = this.#buildReport({
      type: 'manual',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      ...context
    });

    this.#send(report);
  }

  // =========================================================================
  // GLOBAL LISTENERS
  // =========================================================================

  /**
   * window 'error' event handler.
   * Runtime errors: undefined variable, null property access, syntax error, etc.
   *
   * Only errors from same-origin scripts are logged:
   * - Cross-origin scripts only return "Script error." due to CORS, no details
   * - 3rd party errors (analytics, widgets, etc.) are outside our control
   */
  static #handleWindowError = (event) => {
    // Script loading errors (img, script src 404) — skip these
    if (event.target && event.target !== globalThis) {
      return;
    }

    // Cross-origin script errors — generic "Script error." message, skip
    if (event.message === 'Script error.' && !event.filename) {
      return;
    }

    // Same-origin check — only log errors from our own scripts
    if (event.filename && !this.#isSameOrigin(event.filename)) {
      return;
    }

    const report = this.#buildReport({
      type: 'runtime',
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      stack: event.error?.stack || null
    });

    this.#send(report);
  };

  /**
   * window 'unhandledrejection' event handler.
   * Uncaught Promise errors — including errors thrown in Ajax.send callbacks.
   *
   * No origin filter is applied since Promise rejections lack filename info.
   * These errors originate from our own code (3rd party typically handles their own catch).
   */
  static #handleUnhandledRejection = (event) => {
    const reason = event.reason;

    const report = this.#buildReport({
      type: 'promise',
      message: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : null
    });

    this.#send(report);
  };

  // =========================================================================
  // ORIGIN FILTER
  // =========================================================================

  /**
   * Checks if the given URL has the same origin as the current page.
   *
   * Same-origin: same protocol + domain + port
   *   "https://localhost:8080/assets/js/app.js" -> (own script)
   *   "https://cdn.google.com/analytics.js"     -> (3rd party)
   *
   * @param  {string}  url  URL to check (event.filename)
   * @return {boolean}
   */
  static #isSameOrigin (url) {
    try {
      const scriptOrigin = new globalThis.URL(url).origin;

      return scriptOrigin === this.#pageContext.origin;
    } catch (e) {
      // Invalid URL — stay on the safe side, log it
      return true;
    }
  }

  // =========================================================================
  // REPORT BUILDER
  // =========================================================================

  /**
   * Builds a standard report object.
   */
  static #buildReport (data) {
    return {
      timestamp: new Date().toISOString(),
      page: this.#pageContext?.url || globalThis.location?.href,
      userAgent: this.#pageContext?.userAgent || null,
      ...data
    };
  }

  // =========================================================================
  // SENDER
  // =========================================================================

  /**
   * Sends the report — deduplicate check first, then beacon or console.
   */
  static #send (report) {
    // Always write to console (for developer visibility)
    console.error('[LogRelay]', report.type, report.message, report);

    // Deduplicate: skip if the same error was sent recently
    const fingerprint = this.#fingerprint(report);

    if (this.#recentFingerprints.has(fingerprint)) {
      return;
    }

    this.#recentFingerprints.set(fingerprint, true);
    globalThis.setTimeout(() => {
      this.#recentFingerprints.delete(fingerprint);
    }, this.#dedupeWindowMs);

    // No endpoint — console output is sufficient
    if (!this.#endpoint) {
      return;
    }

    // Send via sendBeacon (fire-and-forget, works even if page closes)
    try {
      const blob = new globalThis.Blob(
        [JSON.stringify(report)],
        { type: 'application/json' }
      );

      globalThis.navigator.sendBeacon(this.#endpoint, blob);
    } catch (e) {
      // If even sendBeacon fails — last resort, silently skip
      // (no infinite loop risk since we don't call send again inside catch)
    }
  }

  /**
   * Generates a fingerprint for the report (for deduplication).
   * Same message + same source + same line = same error.
   */
  static #fingerprint (report) {
    return `${report.type}:${report.message}:${report.source || ''}:${report.line || ''}`;
  }
}

export default LogRelay;