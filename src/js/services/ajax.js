import Spinner from '../modules/spinner.js';
import Snackbar from '../modules/snackbar.js';
import Language from '../language/core/language.js';
import LogRelay from './log-relay.js';

/**
 * @summary Promise-based AJAX manager using the Fetch API.
 */
class Ajax {
  // --- Static Config ---
  static DEFAULTS = {
    button: null,
    success: () => {},
    error: () => {},
    beforeStart: () => {},
    afterEnd: () => {},
    complete: () => {},
    spinner: false,
    data: {},
    route: '',
    type: 'post',
    timeout: 15000
  };

  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['button', 'Button element to disable during the request. Gets `bttn--loading` class and `disabled`. Default: `null`.'],
      ['route', 'Request endpoint. Required.'],
      ['data', 'Data to send. Object or FormData. Default: `{}`.'],
      ['type', 'Request method. `get` or `post`. Default: `post`.'],
      ['spinner', 'Spinner type during request. `false`, `main`, or `helper`. Default: `false`.'],
      ['success', 'Callback on successful response (HTTP 2xx).'],
      ['error', 'Callback on error (network error, timeout, HTTP 4xx/5xx).'],
      ['beforeStart', 'Callback fired just before the request starts.'],
      ['afterEnd', 'Callback fired last, after the request finishes (success or error).'],
      ['complete', 'Callback fired when a response is received from the server.'],
      ['timeout', 'Request timeout in ms. Default: `15000`.']
    ]);
    const availableMethods = new Map([
      ['Ajax.request(options)', 'Async AJAX request returning a Promise. Use with await: `const data = await Ajax.request({ route })`.'],
      ['Ajax.send(options)', 'Fire-and-forget AJAX request. Callback-based (success/error). Errors are reported to LogRelay.']
    ]);
    console.info('%cAjax', 'font-size: 20px; font-weight: bold; color: red');
    console.info('%cConfig:', 'font-size: 14px; font-weight: bold; color: blue');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
    console.info('%cAPI:', 'font-size: 14px; font-weight: bold; color: blue');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Initiates an AJAX request.
   * @param {object} options - AJAX settings.
   * @returns {Promise<any>} A Promise containing the response data.
   */
  static async request (options = {}) {
    const config = { ...Ajax.DEFAULTS, ...options };
    const controller = new globalThis.AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), config.timeout);
    
    const standardError = { error: [Language.get('errorUnexpected')] };

    try {
      if (config.button) {
        this.#lockButton(config.button);
      }

      config.beforeStart();
      if (config.spinner) Spinner.show({ type: config.spinner });

      let url = config.route.startsWith('http') ? config.route : `index.php?route=${config.route}`;
      
      if (config.type.toUpperCase() === 'GET' && Object.keys(config.data).length > 0) {
        const queryParams = new globalThis.URLSearchParams(config.data).toString();
        url += (url.includes('?') ? '&' : '?') + queryParams;
      }
      
      const fetchOptions = this.#prepareFetchOptions(config, controller.signal);
      
      const response = await globalThis.fetch(url, fetchOptions);
      const responseText = await response.text();
      
      // Content-Type check
      const contentType = response.headers.get('Content-Type') || '';
      const isJsonResponse = contentType.includes('application/json');
      
      // JSON parse only when Content-Type is JSON
      let responseData = null;
      let parseError = false;
      
      if (isJsonResponse) {
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          parseError = true;
        }
      }
      
      const mockXhttp = {
        responseText: responseText,
        responseData: responseData,
        status: response.status,
        ok: response.ok,
        headers: response.headers
      };
      
      config.complete(mockXhttp);

      // Error: HTTP error OR (expected JSON but parse failed)
      if (!response.ok || (isJsonResponse && parseError)) {
        const uiMessageObject = responseData?.message || 
          (parseError ? { error: ['Invalid server response (JSON parse error).'] } : standardError);

        console.error('Ajax Error:', {
          status: response.status,
          url: url,
          contentType: contentType,
          parseError: parseError,
          body: responseText
        });

        Snackbar.insert(uiMessageObject);
        
        const errorText = uiMessageObject.error?.[0] || uiMessageObject.warning?.[0] || standardError.error[0];
        const errorObj = new Error(errorText);
        config.error(errorObj);
        
        throw errorObj;
      }
      
      // Success
      config.success(mockXhttp);

      return responseData ?? responseText;
      
    } catch (error) {
      if (error.name === 'TypeError') {
        const networkError = { error: [Language.get('errorNetwork')] };
        console.error('Ajax Network Error:', { error: error });
        Snackbar.insert(networkError);
        config.error(error);
      } else if (error.name === 'AbortError') {
        const timeoutError = { error: [Language.get('errorTimeout')] };
        console.error('Ajax Timeout Error:', { error: error });
        Snackbar.insert(timeoutError);
        config.error(error);
      }

      throw error;
    } finally {
      globalThis.clearTimeout(timeoutId);
      config.afterEnd();
      if (config.spinner) Spinner.hide();

      if (config.button) {
        this.#unlockButton(config.button);
      }
    }
  }

  /**
   * Fire-and-forget AJAX request for callback-based usage.
   * Errors are automatically reported to LogRelay.
   * @param {AjaxConfig} options - AJAX settings.
   */
  static send (options) {
    this.request(options).catch((error) => {
      if (error?.name !== 'AbortError') {
        LogRelay.capture(error, {
          component: 'Ajax.send',
          route: options?.route || null
        });
      }
    });
  }

  // --- Private Helper Methods ---

  /**
   * Button loading lock — Reference Counting
   *
   * Problem: A success callback may start a second Ajax request with the same button
   * (nested/chained requests). The outer request's finally block would remove
   * bttn--loading before the inner request finishes, making the button clickable again.
   *
   * Example: changeOrderProductState(button) -> success -> reloadOrderItemView(button)
   *   t0: Outer request -> lock (refCount=1, loading+disabled)
   *   t1: success callback -> inner request -> lock (refCount=2)
   *   t2: Outer finally -> unlock (refCount=1, button STAYS LOCKED)
   *   t3: Inner finally -> unlock (refCount=0, loading removed)
   *
   * Solution: Same pattern as jQuery ajaxStart/ajaxStop and NProgress — track active
   * request count on the button, only unlock when it reaches zero.
   *
   * NOTE: This mechanism becomes unnecessary once all callers migrate from callbacks
   * to await. With await, the outer request won't reach finally until the inner completes:
   *   const data = await Ajax.request({ button, route: '...' });
   *   await Ajax.request({ button, route: '...reload' });  // Sequential
   *   // finally -> both requests done, no refCount needed
   */
  static #lockButton = (button) => {
    button.__ajaxRefCount = (button.__ajaxRefCount || 0) + 1;
    button.classList.add('bttn--loading');
    button.disabled = true;
  };

  static #unlockButton = (button) => {
    button.__ajaxRefCount--;

    if (button.__ajaxRefCount <= 0) {
      button.classList.remove('bttn--loading');
      button.disabled = false;
      button.__ajaxRefCount = 0;
    }
  };

  static #prepareFetchOptions = (config, signal) => {
    const options = {
      method: config.type.toUpperCase(),
      signal: signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    if (options.method === 'POST') {
      if (config.data instanceof globalThis.FormData) {
        options.body = config.data;
      } else if (Object.keys(config.data).length > 0){
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
        options.body = new globalThis.URLSearchParams(Object.entries(config.data)).toString();
      }
    }

    return options;
  };
}

export default Ajax;