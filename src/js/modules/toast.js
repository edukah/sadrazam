import Modal from './modal.js';
import Language from '../language/core/language.js';

/**
 * @summary Modal-based toast notification helper.
 * Pops up like bread from a toaster — appears, delivers the message, disappears.
 * Uses Modal internally for the overlay; adds typed message lists and auto-dismiss.
 */
class Toast {
  /**
   * Prints available configuration and API methods to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['message', 'Message to display. Object format (e.g. { success: "Done!" }). Required.'],
      ['time', 'Auto-close delay in ms. Default: `27000`.'],
      ['size', 'Modal size (`sm`, `md`, `lg`). Default: `md`.'],
      ['position', 'Vertical position (`top`, `center`, `bottom`). Default: `center`.'],

      ['dismissButton', 'Shows a dismiss button. Default: `false`. `true` when opened via listen().']
    ]);
    const availableMethods = new Map([
      ['Toast.insert(options)', 'Displays the message in a modal.'],
      ['Toast.autoInit()', 'Adds click listeners to elements with data-toggle="toast".']
    ]);
    console.info('%cToast', 'font-size: 20px; font-weight: bold; color: red');
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
   * Adds click listeners to elements with data-toggle="toast".
   * Reads data-type (default: hint) and data-message attributes.
   */
  static autoInit () {
    document.querySelectorAll('[data-toggle="toast"]').forEach(element => {
      element.addEventListener('click', () => {
        const type = element.getAttribute('data-type') || 'hint';
        const text = element.getAttribute('data-message');
        if (text) this.insert({ message: { [type]: text }, size: 'sm', dismissButton: true });
      });
    });
  }

  /**
   * Displays a message in a modal with typed message lists and auto-dismiss.
   * @param {object} options - Message options.
   */
  static insert ({ message = {}, time = 27000, size = 'md', position = 'center', closeOnClick = true, dismissButton = false, ...otherOptions }) {
    if (!message || Object.keys(message).length === 0) {
      return;
    }

    const body = document.createElement('div');
    body.className = 'modal__body';
    body.setAttribute('role', 'alert');
    body.setAttribute('aria-live', 'polite');
    body.setAttribute('aria-atomic', 'true');

    const container = document.createElement('div');
    container.className = 'toast__container';

    for (const type of Object.keys(message)) {
      const messages = Array.isArray(message[type]) ? message[type] : [message[type]];
      const ul = document.createElement('ul');
      ul.className = `toast__list toast__list--${type}`;
      ul.innerHTML = messages.map(msg => `<li>${msg}</li>`).join('');
      container.appendChild(ul);
    }

    if (dismissButton) {
      const action = document.createElement('div');
      action.className = 'toast__action';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bttn--neutral';
      btn.setAttribute('data-modal-close', '');
      btn.textContent = Language.get('buttonDismiss');
      action.appendChild(btn);
      container.appendChild(action);
    }

    body.appendChild(container);

    return Modal.insert({ content: body, size, position, time, closeOnClick, closeOtherModals: false, ...otherOptions });
  }
}

export default Toast;
