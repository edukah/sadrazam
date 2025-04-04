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
      ['[data-fvalidate]', 'Input to validate. Contains rules (e.g. "required|email").'],
      ['[data-fvalidate-message]', 'Custom message that overrides the default error message.'],
      ['[data-fvalidate-display]', 'Where to display the error message (\'placeholder\' or a CSS selector).'],
      ['[data-fvalidate-scope]', 'Error message scope. "parent" → inserts message after the input parent element.'],
      ['togglePasswordVisibility(button)', 'Toggles password field visibility when the button is clicked.']
    ]);
    console.info('%cForm', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });

    const availableRules = new Map([
      ['required', 'Required field. Cannot be empty.'],
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
    console.info('%cAvailable Rules (used in data-fvalidate)', 'margin-top: 10px; font-size: 14px; font-weight: bold; color: blue');
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
        console.error('Form: Invalid regex pattern.', ruleValue, e);
        
        return null;
      }
    }
  };

  static #parseNumericValue = (value) => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const number = Number(value.replaceAll(',', ''));
    
    return isNaN(number) ? null : number;
  };

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
    const itemsToValidate = targetElem.hasAttribute('data-fvalidate') ? [targetElem] : (formElem ? Array.from(formElem.querySelectorAll('[data-fvalidate]')) : []);
    
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
    const ruleStrings = (item.getAttribute('data-fvalidate') || '').split('|');
    for (const ruleString of ruleStrings) {
      const [ruleName, ruleValue] = ruleString.split(/:(.*)/s);
      const ruleFn = this.rules[ruleName];
      if (ruleFn) {
        const result = ruleFn.call(this, item, form, ruleValue);
        if (result) return this.#formatErrorMessage(result);
      } else {
        console.warn(`Form: Unknown validation rule '${ruleName}'.`, item);
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
    console.warn(`Form: Missing language key '${errorKey}'.`);
    
    return errorKey;
  };

  static #insertMessageForInput = (targetInput, warningMessage = '') => {
    this.#attachValidationListener(targetInput);
    if (document.getElementById(targetInput.getAttribute('data-fvalidate-message-id'))) return;

    targetInput.style.borderColor = 'red';
    const uniqueId = 'warn-' + globalThis.crypto.randomUUID();
    targetInput.setAttribute('data-fvalidate-message-id', uniqueId);

    const finalMessage = targetInput.getAttribute('data-fvalidate-message') || warningMessage;

    if (targetInput.getAttribute('data-fvalidate-display') === 'placeholder' && targetInput.placeholder) {
      targetInput.setAttribute('data-fvalidate-default-placeholder', targetInput.placeholder);
      targetInput.placeholder = finalMessage;
      
      return;
    }

    const span = document.createElement('span');
    span.id = uniqueId;
    span.className = 'danger-text';
    span.textContent = finalMessage;

    const container = document.querySelector(targetInput.getAttribute('data-fvalidate-display')) || document.getElementById(`err-${targetInput.name}`);

    if (container) {
      container.appendChild(span);
    } else if (targetInput.getAttribute('data-fvalidate-scope') === 'parent') {
      targetInput.parentNode.after(span);
    } else {
      targetInput.after(span);
    }
  };

  static #removeInputMessage = (targetInput) => {
    targetInput.style.borderColor = '';
    const defaultPlaceholder = targetInput.getAttribute('data-fvalidate-default-placeholder');
    if (defaultPlaceholder) {
      targetInput.placeholder = defaultPlaceholder;
      targetInput.removeAttribute('data-fvalidate-default-placeholder');
    }
    const warnId = targetInput.getAttribute('data-fvalidate-message-id');
    if (warnId) {
      document.getElementById(warnId)?.remove();
      targetInput.removeAttribute('data-fvalidate-message-id');
    }
  };

  static #insertMessageForForm = (formElem) => {
    const msg = formElem.getAttribute('data-fvalidate-message');
    if (!msg) return;

    if (formElem.getAttribute('data-fvalidate-display') === 'popup') {
      Snackbar.insert({ error: [msg] });
      
      return;
    }

    const container = document.querySelector(formElem.getAttribute('data-fvalidate-display'));
    if (!container || formElem.getAttribute('data-fvalidate-message-id')) return;

    const uniqueId = 'form-warn-' + globalThis.crypto.randomUUID();
    formElem.setAttribute('data-fvalidate-message-id', uniqueId);

    const span = document.createElement('span');
    span.id = uniqueId;
    span.textContent = msg;
    container.appendChild(span);
  };

  static #removeFormMessage = (formElem) => {
    const warnId = formElem.getAttribute('data-fvalidate-message-id');
    if (warnId) {
      document.getElementById(warnId)?.remove();
      formElem.removeAttribute('data-fvalidate-message-id');
    }
  };

  static togglePasswordVisibility (button) {
    const input = button.previousElementSibling;
    if (input?.tagName !== 'INPUT') return;
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    button.innerHTML = isPw ? '<i class="ph ph-eye-closed"></i>' : '<i class="ph ph-eye"></i>';
  }
}

export default Form;

