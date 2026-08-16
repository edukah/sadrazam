/**
 * @summary Static URL parameter helpers using the URL and URLSearchParams APIs.
 */
class Url {
  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['get(key, url?)', 'Gets the value of the specified parameter from the URL.'],
      ['has(key, url?)', 'Checks if the specified parameter exists in the URL.'],
      ['set(key, value, url?)', 'Adds or updates a parameter in the URL. Slashes in the query stay readable (/, not %2F).'],
      ['delete(key, url?)', 'Deletes a parameter from the URL. Slashes in the query stay readable (/, not %2F).'],
      ['getAll(url?)', 'Returns all parameters from the URL as a JavaScript object.']
    ]);
    console.info('%cUrl', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Gets the value of the specified parameter from the URL.
   * @param {string} key - Parameter name.
   * @param {string} [url=window.location.href] - URL to read from.
   * @returns {string|null} Parameter value or null if not found.
   */
  static get (key, url = window.location.href) {
    try {
      const urlObj = new globalThis.URL(url, window.location.origin);
      
      return urlObj.searchParams.get(key);
    } catch (e) {
      console.warn(`[Sadrazam|Url] get(): Invalid URL format: "${url}"`);
      
      return null;
    }
  }

  /**
   * Checks if the specified parameter exists in the URL.
   * @param {string} key - Parameter name.
   * @param {string} [url=window.location.href] - URL to check.
   * @returns {boolean} True if the parameter exists, false otherwise.
   */
  static has (key, url = window.location.href) {
    try {
      const urlObj = new globalThis.URL(url, window.location.origin);
      
      return urlObj.searchParams.has(key);
    } catch (e) {
      console.warn(`[Sadrazam|Url] has(): Invalid URL format: "${url}"`);
      
      return false;
    }
  }

  /**
   * Adds or updates a parameter in the URL. Returns a new URL string.
   * @param {string} key - Parameter name.
   * @param {string} value - Parameter value.
   * @param {string} [url=window.location.href] - URL to modify.
   * @returns {string} Updated URL or the original URL on error.
   */
  static set (key, value, url = window.location.href) {
    try {
      const urlObj = new globalThis.URL(url, window.location.origin);
      urlObj.searchParams.set(key, value);

      return this.#withReadableQuery(urlObj);
    } catch (e) {
      console.warn(`[Sadrazam|Url] set(): Invalid URL format: "${url}". Returning original URL.`);
      
      return url;
    }
  }

  /**
   * Deletes a parameter from the URL. Returns a new URL string.
   * @param {string} key - Parameter name to delete.
   * @param {string} [url=window.location.href] - URL to modify.
   * @returns {string} Updated URL or the original URL on error.
   */
  static delete (key, url = window.location.href) {
    try {
      const urlObj = new globalThis.URL(url, window.location.origin);
      urlObj.searchParams.delete(key);

      return this.#withReadableQuery(urlObj);
    } catch (e) {
      console.warn(`[Sadrazam|Url] delete(): Invalid URL format: "${url}". Returning original URL.`);
      
      return url;
    }
  }

  /**
   * Returns all parameters from the URL as a JavaScript object.
   * @param {string} [url=window.location.href] - URL to read from.
   * @returns {Object} Object containing all parameters. Empty object on error.
   */
  static getAll (url = window.location.href) {
    try {
      const urlObj = new globalThis.URL(url, window.location.origin);
      
      return Object.fromEntries(urlObj.searchParams.entries());
    } catch (e) {
      console.warn(`[Sadrazam|Url] getAll(): Invalid URL format: "${url}"`);
      
      return {};
    }
  }

  /**
   * Serializes the URL with readable slashes in the query.
   *
   * URLSearchParams re-serializes the whole query with the form-urlencoded rules and turns
   * every `/` into `%2F` (`route=a/b/c` → `route=a%2Fb%2Fc`). A slash is a legal raw
   * character in a query (RFC 3986 §3.4) and servers decode both forms identically, so this
   * only restores readability — it is not a decoding step. Only the query is touched
   * (`%2F` in the path is meaningful and stays); `&`, `=`, `?`, `#`, `+`, `%` stay encoded,
   * so nested URLs inside a value keep their structure. The `search` setter does not
   * re-encode `/`.
   *
   * @param {URL} urlObj - Already-mutated URL object.
   * @returns {string} Absolute URL string.
   */
  static #withReadableQuery (urlObj) {
    urlObj.search = urlObj.search.replace(/%2F/g, '/');

    return urlObj.href;
  }
}

export default Url;
