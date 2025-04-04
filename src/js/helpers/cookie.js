/**
 * @summary Static cookie manager for reading, writing, and deleting browser cookies.
 */
class Cookie {
  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['get(name)', 'Returns the value of the specified cookie.'],
      ['set(name, value, options?)', 'Creates or updates a cookie. `options` can include `expires` (seconds), `path`, `domain`, etc.'],
      ['delete(name, options?)', 'Deletes the specified cookie.']
    ]);
    console.info('%cCookie', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Gets the value of the specified cookie.
   * @param {string} name - Cookie name.
   * @returns {string|null} Cookie value or null if not found.
   */
  static get (name) {
    if (typeof document === 'undefined') return null;
    
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${encodeURIComponent(name).replace(/[-.+*]/g, '\\$&')}=([^;]*)`));
    
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Creates or updates a cookie.
   * @param {string} name - Cookie name.
   * @param {string} value - Cookie value.
   * @param {object} [options={}] - Optional settings.
   * @param {number} [options.expires=600] - Expiration time (seconds).
   * @param {string} [options.path='/'] - Cookie path.
   * @param {string} [options.domain] - Cookie domain.
   * @param {boolean} [options.secure] - HTTPS only.
   * @param {string} [options.sameSite='Lax'] - SameSite policy.
   */
  static set (name, value, { expires = 600, path = '/', domain = '', secure = false, sameSite = 'Lax' } = {}) {
    if (typeof document === 'undefined') return;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    if (path) cookieString += `; path=${path}`;
    if (domain) cookieString += `; domain=${domain}`;
    if (secure) cookieString += `; secure`;
    if (sameSite) cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }
  
  /**
   * Deletes the specified cookie.
   * @param {string} name - Cookie name.
   * @param {object} [options={}] - Optional settings (path, domain).
   */
  static delete (name, { path = '/', domain = '' } = {}) {
    // Deleting a cookie by setting its expiration to a past date.
    this.set(name, '', { expires: -1, path, domain });
  }
}

export default Cookie;
