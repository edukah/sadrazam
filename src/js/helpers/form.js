import Language from '../language/core/language.js';
import Snackbar from '../modules/snackbar.js';

/**
 * @summary Rule-based form validation manager using HTML data attributes.
 */
class Form {
  // --- Private Static Fields ---
  static #listenerMap = new WeakMap();
  static #observerMap = new WeakMap();
  static #debounceTimerMap = new WeakMap();

  /**
   * Prints available configuration options to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['perform(selector?)', 'Starts real-time and on-submit validation for forms on the page.'],
      ['validate(element)', 'Manually validates a single form or input.'],
      ['clearInputMessage(input)', 'Clears a shown validation error (is-error + message) for an input.'],
      ['[data-form-validate]', 'Input to validate. Contains rules (e.g. "required|email").'],
      ['[data-form-validate-message]', 'Custom message that overrides the default error message.'],
      ['[data-form-validate-display]', 'Where to display the error message (\'placeholder\' or a CSS selector).'],
      ['[data-form-validate-scope]', 'Error message scope. "parent" → inserts message after the input parent element.'],
      ['togglePasswordVisibility(button)', 'Toggles password field visibility when the button is clicked.']
    ]);
    console.info('%cForm', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });

    const availableRules = new Map([
      ['required', 'Required field. Cannot be empty.'],
      ['required_with:fieldA,fieldB', 'Required only if any of the listed fields has a value.'],
      ['matches:fieldName', 'Value must match the input with `name="fieldName"`.'],
      ['not_match:fieldName', 'Value must not match the input with `name="fieldName"`.'],
      ['email', 'Must be a valid email address format.'],
      ['min_length:X', 'Value must be at least X characters long.'],
      ['max_length:X', 'Value must be at most X characters long.'],
      ['min_value:X', 'Value must be at least X (numeric).'],
      ['max_value:X', 'Value must be at most X (numeric).'],
      ['less_than:fieldName', 'Value must be less than the input with `name="fieldName"` (numeric).'],
      ['greater_than:fieldName', 'Value must be greater than the input with `name="fieldName"` (numeric).'],
      ['regex:pattern', 'Value must match the specified regular expression pattern.']
    ]);
    console.info('%cAvailable Rules (used in data-form-validate)', 'margin-top: 10px; font-size: 14px; font-weight: bold; color: blue');
    availableRules.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: blue', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Extensible rule engine. Each function returns an object or string on error, null otherwise.
   */
  static rules = {
    required: (item, form) => {
      if (['radio', 'checkbox'].includes(item.type)) {
        return !form.querySelector(`[name="${item.name}"]:checked`) ? 'requiredRadio' : null;
      }
      
      return !item.value.trim() ? (item.matches('select') ? 'requiredSelect' : 'requiredDefault') : null;
    },
    required_with: (item, form, ruleValue) => {
      // Required only if any of the comma-separated sibling fields has a value (Laravel-style).
      const triggered = (ruleValue || '').split(',').some((name) => {
        const sibling = form.querySelector(`[name="${name.trim()}"]`);

        return sibling && sibling.value.trim() !== '';
      });

      if (!triggered) {
        return null;
      }

      if (['radio', 'checkbox'].includes(item.type)) {
        return !form.querySelector(`[name="${item.name}"]:checked`) ? 'requiredRadio' : null;
      }

      return !item.value.trim() ? (item.matches('select') ? 'requiredSelect' : 'requiredDefault') : null;
    },
    matches: (item, form, ruleValue) => {
      if (!item.value) return null;
      const matchElem = form.querySelector(`[name="${ruleValue}"]`);
      
      return (matchElem && item.value !== matchElem.value) ? 'confirmMismatch' : null;
    },
    not_match: (item, form, ruleValue) => {
      const notMatchElem = form.querySelector(`[name="${ruleValue}"]`);
      
      return (notMatchElem && item.value && item.value === notMatchElem.value) ? 'currentSame' : null;
    },
    email: (item) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      return (item.value && !emailRegex.test(item.value)) ? 'emailFormat' : null;
    },
    min_length: (item, _, ruleValue) => {
      if (!item.value) return null;
      
      return item.value.length < parseInt(ruleValue, 10) ? { key: 'minLength', params: { value: ruleValue } } : null;
    },
    max_length: (item, _, ruleValue) => {
      if (!item.value) return null;
      
      return item.value.length > parseInt(ruleValue, 10) ? { key: 'maxLength', params: { value: ruleValue } } : null;
    },
    min_value: (item, _, ruleValue) => {
      const val = this.#parseNumericValue(item.value);
      const limit = this.#parseNumericValue(ruleValue);
      
      return (val !== null && val < limit) ? { key: 'limitMin', params: { value: ruleValue } } : null;
    },
    max_value: (item, _, ruleValue) => {
      const val = this.#parseNumericValue(item.value);
      const limit = this.#parseNumericValue(ruleValue);
      
      return (val !== null && val > limit) ? { key: 'limitMax', params: { value: ruleValue } } : null;
    },
    less_than: (item, form, ruleValue) => {
      const maxInput = form.querySelector(`[name="${ruleValue}"]`);
      if (!maxInput) return null;
      const minVal = this.#parseNumericValue(item.value);
      const maxVal = this.#parseNumericValue(maxInput.value);
      
      return (minVal !== null && maxVal !== null && minVal > maxVal) ? { key: 'minCompare', params: { value: maxInput.value } } : null;
    },
    greater_than: (item, form, ruleValue) => {
      const minInput = form.querySelector(`[name="${ruleValue}"]`);
      if (!minInput) return null;
      const maxVal = this.#parseNumericValue(item.value);
      const minVal = this.#parseNumericValue(minInput.value);
      
      return (maxVal !== null && minVal !== null && maxVal < minVal) ? { key: 'maxCompare', params: { value: minInput.value } } : null;
    },
    regex: (item, _, ruleValue) => {
      if (!item.value) return null;
      try {
        return !new RegExp(ruleValue).test(item.value) ? 'regexMismatch' : null;
      } catch (e) {
        console.error('[Sadrazam|Form] Invalid regex pattern.', ruleValue, e);
        
        return null;
      }
    }
  };

  /**
   * Parses a decimal the way the active locale writes it.
   *
   * The separator is NOT guessed — it comes from the loaded language file
   * (`decimalPoint`). Consumers pass `languageCode` to `Sadrazam.configure()`,
   * which loads that file; the same key can be overridden via `Language.load()`.
   *
   * Decision tree — only the last branch needs the locale:
   *   1. two different markers      -> the LAST one is decimal   "1.234,56" · "1,234.56"
   *   2. one marker, NOT 3 trailing -> decimal                   "1,5" · "1.5" · "1.2345"
   *   3. space / NBSP               -> grouping (SI, 22nd CGPM 2003 Res. 10)
   *   4. one marker + EXACTLY 3     -> genuinely ambiguous -> locale decides
   *                                    tr: "1.500" = 1500 · "1,500" = 1.5
   *   5. ...unless a leading zero precedes the marker -> decimal, no ambiguity
   *                                    "0.001" -> 0.001 ("0001" is not how anyone writes 1)
   *
   * Previously this stripped every comma (`value.replaceAll(',', '')`), i.e. it
   * assumed the English convention. Under a comma-decimal locale that silently
   * multiplied by ten: "10,5" was read as 105, so a shipping rule with
   * min 10,5 / max 20 failed `less_than` and the form never submitted.
   *
   * @param  {string} value
   * @return {number|null} null when the value is empty or not a recognised number
   */
  static parseDecimal = (value) => {
    if (typeof value !== 'string') return null;

    // Currency decoration is dropped; letters are NOT — 'abc1,5' must stay invalid.
    const cleaned = value
      .trim()
      // \p{Sc} = Unicode "Currency Symbol" — elle yazılmış kod-noktası listesinin yerine.
      // Eski liste 21 sembol eksikti ve \u20A0-\u20BF aralığı eskimişti. Sunucu tarafı
      // (PHP Decimal::normalize) zaten \p{Sc} kullanıyor; iki gramer ayrışmasın.
      .replace(/\p{Sc}/gu, '')
      .replace(/[\s\u00A0\u202F]/gu, '')
      .trim();

    if (cleaned === '' || !/^[+-]?[\d.,]*$/.test(cleaned) || !/\d/.test(cleaned)) return null;

    const dots = (cleaned.match(/\./g) || []).length;
    const commas = (cleaned.match(/,/g) || []).length;

    // A repeated marker can only be regular 3-digit grouping.
    if ((dots > 1 || commas > 1) && !/^[+-]?\d{1,3}(?:([.,])\d{3})+(?:(?!\1)[.,]\d+)?$/.test(cleaned)) {
      return null;
    }

    // No separator at all — the marker is irrelevant.
    if (dots === 0 && commas === 0) {
      const plain = Number(cleaned);

      return isNaN(plain) ? null : plain;
    }

    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    let decimalPos;

    if (lastDot !== -1 && lastComma !== -1) {
      decimalPos = Math.max(lastDot, lastComma);
    } else {
      const position = lastDot !== -1 ? lastDot : lastComma;
      const marker = lastDot !== -1 ? '.' : ',';
      const trailing = cleaned.length - position - 1;
      // A leading zero removes the ambiguity: a grouped number's first group never starts
      // with '0'. "0.001" as grouping would mean "0001", and nobody writes 1 that way — so
      // the marker is decidedly decimal and the locale is irrelevant. Without this branch
      // a comma-decimal locale read "0.001" as 1 (1000x, fatal for high-precision money).
      const leadingZero = cleaned.slice(0, position).replace(/^[+-]/, '').startsWith('0');

      if (trailing !== 3 || leadingZero) {
        decimalPos = position;                    // unambiguous — locale irrelevant
      } else {
        // Genuinely ambiguous. Separator unknown (locale file not loaded yet) -> refuse
        // to guess; the caller skips the rule and the server still validates.
        const decimalPoint = Language.getAll().get('decimalPoint');

        if (decimalPoint === undefined) return null;

        decimalPos = marker === decimalPoint ? position : -1;
      }
    }

    let canonical;

    if (decimalPos === -1) {
      canonical = cleaned.replace(/[^\d\-+]/g, '');   // every marker was grouping
    } else {
      const whole = cleaned.slice(0, decimalPos).replace(/[^\d\-+]/g, '');
      const fraction = cleaned.slice(decimalPos + 1).replace(/\D/g, '');

      canonical = `${whole}.${fraction}`;
    }

    const number = Number(canonical);

    return isNaN(number) ? null : number;
  };

  static #parseNumericValue = (value) => Form.parseDecimal(value);

  static perform (formSelector = 'form') {
    document.querySelectorAll(formSelector).forEach(form => {
      form.addEventListener('submit', this.validate);
    });
  }

  static #inputListener = (formItem) => {
    globalThis.clearTimeout(this.#debounceTimerMap.get(formItem));
    const timerId = globalThis.setTimeout(() => this.validate(formItem), 300);
    this.#debounceTimerMap.set(formItem, timerId);
  };

  static #attachValidationListener = (formItem) => {
    if (this.#listenerMap.has(formItem)) return;
    const eventType = ['radio', 'checkbox', 'select-one'].includes(formItem.type) ? 'change' : 'input';
    const listener = () => this.#inputListener(formItem);
    this.#listenerMap.set(formItem, listener);
    formItem.addEventListener(eventType, listener);

    if (!this.#observerMap.has(formItem)) {
      const observer = new globalThis.MutationObserver((mutations) => {
        if (mutations.some(m => m.attributeName === 'disabled' && m.target.disabled)) {
          this.#removeValidationListener(formItem);
          this.#removeInputMessage(formItem);
        }
      });
      observer.observe(formItem, { attributes: true });
      this.#observerMap.set(formItem, observer);
    }
  };

  static #removeValidationListener = (formItem) => {
    const listener = this.#listenerMap.get(formItem);
    if (listener) {
      const eventType = ['radio', 'checkbox', 'select-one'].includes(formItem.type) ? 'change' : 'input';
      formItem.removeEventListener(eventType, listener);
      this.#listenerMap.delete(formItem);
    }
    this.#observerMap.get(formItem)?.disconnect();
    this.#observerMap.delete(formItem);
  };

  static validate = (elemOrEvent) => {

    const isSubmitEvent = elemOrEvent instanceof globalThis.Event && elemOrEvent.type === 'submit';
    const targetElem = isSubmitEvent ? elemOrEvent.target : elemOrEvent;
    const formElem = targetElem.closest('form');
    const itemsToValidate = targetElem.hasAttribute('data-form-validate') ? [targetElem] : (formElem ? Array.from(formElem.querySelectorAll('[data-form-validate]')) : []);
    
    let isFormValid = true;
    let firstErrorItem = null;

    itemsToValidate.forEach(item => {
      if (item.disabled) {
        this.#removeInputMessage(item);
        
        return;
      }

      const errorMessage = this.#validateSingleInput(item, formElem);
      if (errorMessage) {
        isFormValid = false;
        if (!firstErrorItem) firstErrorItem = item;
        this.#insertMessageForInput(item, errorMessage);
      } else {
        this.#removeInputMessage(item);
      }
    });

    if (isSubmitEvent && !isFormValid) {
      elemOrEvent.preventDefault();
      if (firstErrorItem) {
        firstErrorItem.focus();
        firstErrorItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    if(formElem){
      isFormValid ? this.#removeFormMessage(formElem) : this.#insertMessageForForm(formElem);
    }

    return isFormValid;
  };

  static #validateSingleInput = (item, form) => {
    const ruleStrings = (item.getAttribute('data-form-validate') || '').split('|');
    for (const ruleString of ruleStrings) {
      const [ruleName, ruleValue] = ruleString.split(/:(.*)/s);
      const ruleFn = this.rules[ruleName];
      if (ruleFn) {
        const result = ruleFn.call(this, item, form, ruleValue);
        if (result) return this.#formatErrorMessage(result);
      } else {
        console.warn(`[Sadrazam|Form] Unknown validation rule '${ruleName}'.`, item);
      }
    }
    
    return null;
  };

  static #formatErrorMessage = (validationResult) => {
    const errorKey = typeof validationResult === 'object' ? validationResult.key : validationResult;
    const params = typeof validationResult === 'object' ? validationResult.params : {};
    let message = Language.get(errorKey);
    if (message) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(`{${param}}`, value);
      });
      
      return message;
    }
    console.warn(`[Sadrazam|Form] Missing language key '${errorKey}'.`);
    
    return errorKey;
  };

  static #insertMessageForInput = (targetInput, warningMessage = '') => {
    this.#attachValidationListener(targetInput);
    if (document.getElementById(targetInput.getAttribute('data-form-validate-message-id'))) return;

    // Durum sınıfla taşınır, inline stille değil: ham 'red' palet dışıydı ve
    // inline stil temanın/consumer'ın ezmesine kapalıydı. `is-error` kuralı
    // components/_form-patterns.scss'te (--color-danger-500).
    targetInput.classList.add('is-error');
    const uniqueId = 'warn-' + globalThis.crypto.randomUUID();
    targetInput.setAttribute('data-form-validate-message-id', uniqueId);

    const finalMessage = targetInput.getAttribute('data-form-validate-message') || warningMessage;

    if (targetInput.getAttribute('data-form-validate-display') === 'placeholder' && targetInput.placeholder) {
      targetInput.setAttribute('data-form-validate-default-placeholder', targetInput.placeholder);
      targetInput.placeholder = finalMessage;
      
      return;
    }

    const span = document.createElement('span');
    span.id = uniqueId;
    span.className = 'form-text-error';
    span.textContent = finalMessage;

    const errId = 'err' + targetInput.name.charAt(0).toUpperCase()
      + targetInput.name.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase());
    const container = document.querySelector(targetInput.getAttribute('data-form-validate-display'))
      || document.getElementById(errId);

    if (container) {
      container.appendChild(span);
    } else if (targetInput.getAttribute('data-form-validate-scope') === 'parent') {
      targetInput.parentNode.after(span);
    } else {
      targetInput.after(span);
    }
  };

  static #removeInputMessage = (targetInput) => {
    targetInput.classList.remove('is-error');
    const defaultPlaceholder = targetInput.getAttribute('data-form-validate-default-placeholder');
    if (defaultPlaceholder) {
      targetInput.placeholder = defaultPlaceholder;
      targetInput.removeAttribute('data-form-validate-default-placeholder');
    }
    const warnId = targetInput.getAttribute('data-form-validate-message-id');
    if (warnId) {
      document.getElementById(warnId)?.remove();
      targetInput.removeAttribute('data-form-validate-message-id');
    }
  };

  static #insertMessageForForm = (formElem) => {
    const msg = formElem.getAttribute('data-form-validate-message');
    if (!msg) return;

    if (formElem.getAttribute('data-form-validate-display') === 'popup') {
      Snackbar.insert({ error: [msg] });
      
      return;
    }

    const container = document.querySelector(formElem.getAttribute('data-form-validate-display'));
    if (!container || formElem.getAttribute('data-form-validate-message-id')) return;

    const uniqueId = 'form-warn-' + globalThis.crypto.randomUUID();
    formElem.setAttribute('data-form-validate-message-id', uniqueId);

    const span = document.createElement('span');
    span.id = uniqueId;
    span.textContent = msg;
    container.appendChild(span);
  };

  static #removeFormMessage = (formElem) => {
    const warnId = formElem.getAttribute('data-form-validate-message-id');
    if (warnId) {
      document.getElementById(warnId)?.remove();
      formElem.removeAttribute('data-form-validate-message-id');
    }
  };

  static togglePasswordVisibility (button) {
    const input = button.previousElementSibling;
    if (input?.tagName !== 'INPUT') return;
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    button.innerHTML = isPw ? '<i class="ph ph-eye-closed"></i>' : '<i class="ph ph-eye"></i>';
  }

  /**
   * Clears a shown validation error (is-error class + message) for an input, programmatically.
   *
   * Use when a field is removed from view WITHOUT being disabled (e.g. a multi-step form that hides
   * the step): the observer-based auto-cleanup only fires on disabled→true, so a stale error would
   * otherwise linger. Does NOT detach the real-time validate listener — live validation resumes when
   * the field is filled again.
   *
   * @param {HTMLElement} input The input whose error message should be cleared.
   */
  static clearInputMessage (input) {
    if (input) {
      this.#removeInputMessage(input);
    }
  }
}

export default Form;

