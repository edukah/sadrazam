/**
 * @summary Static singleton i18n (internationalization) manager.
 * @description Stores all translation key-value pairs in a single static Map.
 * Accessing via import or Sadrazam.Language reaches the same Map.
 *
 * Usage:
 *   Language.init('tr');                          // Async locale loading
 *   Language.load({ key: 'value', ... });         // Manual loading
 *   Language.get('requiredDefault');               // Key lookup
 *   Language.set('customKey', 'Custom value');     // Single key addition
 *   await Language.ready();                        // Wait until loaded
 */
class Language {
  // --- Private Static Fields ---
  static #words = new Map();
  static #langCode = 'en';
  static #loaded = false;
  static #initPromise = null;

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['init(langCode?)', 'Loads the language file asynchronously. Default: document.documentElement.lang or \'en\'.'],
      ['ready()', 'Returns a Promise that resolves when the language file is loaded.'],
      ['load(translations)', 'Bulk-loads translations from a key-value object.'],
      ['get(key)', 'Returns the translation for the given key. Falls back to a humanized key.'],
      ['set(key, value)', 'Adds or updates a single key-value pair.'],
      ['getAll()', 'Returns all loaded translations as a Map.'],
      ['getLangCode()', 'Returns the active language code.'],
      ['isLoaded()', 'Returns whether the language file is loaded.'],
      ['loadExternal(basePath)', 'Loads translations from an external script file.']
    ]);
    console.info('%cLanguage', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  /**
   * Initializes the Language module by loading the language file.
   * Only the first call takes effect if called multiple times.
   *
   * @param  {string|null} [langCode]  Language code (e.g. 'tr', 'en'). If null, uses document.lang.
   * @return {Promise<void>}
   */
  static init (langCode = 'auto') {
    if (langCode === 'auto' || !langCode) {
      langCode = document.documentElement.lang || 'en';
    }

    this.#langCode = langCode;
    this.#initPromise = this.#loadFromFile(this.#langCode);

    return this.#initPromise;
  }

  /**
   * Promise that resolves when the language file is loaded.
   * Use await Language.ready() before calling Language.get() during page load.
   *
   * @return {Promise<void>}
   */
  static ready () {
    return this.#initPromise ?? Promise.resolve();
  }

  // =========================================================================
  // CRUD
  // =========================================================================

  /**
   * Bulk-loads translations from a key-value object.
   *
   * @param {object} translations  Translation object in { key: 'value', ... } format
   */
  static load (translations) {
    Object.entries(translations).forEach(([key, value]) => {
      this.#words.set(key, value);
    });

    this.#loaded = true;
  }

  /**
   * Adds or updates a single key-value pair.
   *
   * @param  {string} key
   * @param  {string} value
   */
  static set (key, value) {
    this.#words.set(key, value);
  }

  /**
   * Returns the translation for the given key.
   * Falls back to a humanized version if not found (e.g. 'requiredDefault' -> 'Required default').
   *
   * @param  {string} key
   * @return {string}
   */
  static get (key) {
    return this.#words.get(key) ?? this.humanizeKey(key);
  }

  /**
   * Returns all loaded translations as a Map.
   *
   * @return {Map<string, string>}
   */
  static getAll () {
    return this.#words;
  }

  /**
   * Returns the active language code.
   *
   * @return {string}
   */
  static getLangCode () {
    return this.#langCode;
  }

  /**
   * Returns whether the language file has been loaded.
   *
   * @return {boolean}
   */
  static isLoaded () {
    return this.#loaded;
  }

  // =========================================================================
  // HUMANIZE
  // =========================================================================

  /**
   * Converts a camelCase or snake_case key to a human-readable format.
   * 'requiredDefault' → 'Required default'
   * 'error_file_missing' → 'Error file missing'
   *
   * @param  {string} key
   * @return {string}
   */
  static humanizeKey (key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }

  // =========================================================================
  // LOADERS
  // =========================================================================

  /**
   * Loads translations from an internal locale file (dynamic import).
   * Falls back to 'en' if not found.
   *
   * @param  {string} langCode
   * @return {Promise<void>}
   */
  static async #loadFromFile (langCode) {
    try {
      const module = await import(`../locales/${langCode}.js`);
      this.load(module.default);
    } catch (err) {
      console.warn(`Language file not found (${langCode}), loading fallback language.`, err);

      try {
        const fallbackModule = await import(`../locales/en.js`);
        this.load(fallbackModule.default);
      } catch (fallbackErr) {
        console.error('Failed to load fallback language file (en).', fallbackErr);
      }
    }
  }
}

export default Language;