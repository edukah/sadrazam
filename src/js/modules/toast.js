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
      ['size', 'Modal size (`small`, `medium`, `large`). Default: `medium`.'],
      ['position', 'Vertical position (`top`, `center`, `bottom`). Default: `center`.'],
      ['fontSize', 'Message font size (`sm`, `md`, `lg`). Default: `md`.'],
      ['dismissButton', 'Shows a dismiss button. Default: `false`. `true` when opened via listen().']
    ]);
    const availableMethods = new Map([
      ['Toast.insert(options)', 'Displays the message in a modal.'],
      ['Toast.listen()', 'Adds click listeners to elements with data-toggle="toast".']
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
  static listen () {
    document.querySelectorAll('*[data-toggle="toast"]').forEach(element => {
      element.addEventListener('click', () => {
        const type = element.getAttribute('data-type') || 'hint';
        const text = element.getAttribute('data-message');
        if (text) this.insert({ message: { [type]: text }, size: 'small', fontSize: 'sm', dismissButton: true });
      });
    });
  }

  /**
   * Displays a message in a modal with typed message lists and auto-dismiss.
   * @param {object} options - Message options.
   */
  static insert ({ message = {}, time = 27000, size = 'medium', position = 'center', fontSize = 'md', closeOnClick = true, dismissButton = false, ...otherOptions }) {
    const sizeMap = { small: 'sm', medium: 'md', large: 'lg' };
    const modalSize = sizeMap[size] || 'md';
    const fontSizeMap = { sm: 'modal__body--sm', md: 'modal__body--md', lg: 'modal__body--lg' };
    const fontSizeClass = fontSizeMap[fontSize] || 'modal__body--md';

    const messageListsHTML = Object.keys(message)
      .map(type => {
        const messages = Array.isArray(message[type]) ? message[type] : [message[type]];

        return `
          <ul class="toast__list toast__list--${type}">
            ${messages.map(msg => `<li>${msg}</li>`).join('')}
          </ul>
        `;
      }).join('');

    const bodyHTML = `
      <div class="modal__body ${fontSizeClass}" role="alert" aria-live="polite" aria-atomic="true">
        ${messageListsHTML}
        ${dismissButton ? `<div class="toast__dismiss"><button type="button" class="bttn bttn--neutral bttn--${fontSize}-rectangle" data-modal-close>${Language.get('buttonDismiss')}</button></div>` : ''}
      </div>
    `;

    Modal.insert({ content: bodyHTML, size: modalSize, position, time, closeOnClick, closeOtherModals: false, ...otherOptions });
  }
}

export default Toast;
