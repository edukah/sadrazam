/**
 * @summary Singleton backdrop manager with stack-based ownership.
 */
class Backdrop {
  // --- Private Static Fields ---
  static #element = null;
  static #stack = [];

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableMethods = new Map([
      ['insert(options?)', 'Shows or updates the backdrop. Returns an `ownerId`.'],
      ['remove(ownerId?)', 'Withdraws a backdrop request. If no `ownerId` given, removes the most recent one.']
    ]);
    console.info('%cBackdrop', 'font-size: 20px; font-weight: bold; color: red');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Handles backdrop click. Invokes the top owner's onClick callback.
   */
  static #handleClick = () => {
    if (this.#stack.length > 0) {
      const topOwner = this.#stack[this.#stack.length - 1];
      if (topOwner && typeof topOwner.onClick === 'function') {
        topOwner.onClick();
      }
    }
  };
  
  /**
   * Handles the backdrop's exit transition end. Serves as a cleanup point.
   */
  static #handleTransitionEnd = () => {
    // Final check: ensure the stack is still empty.
    // Guards against another component reopening the backdrop during the animation.
    if (this.#stack.length === 0 && this.#element) {
      // Optional: fully remove the element from the DOM:
      // this.#element.remove();
      // this.#element = null;
    }
  };

  /**
   * Shows or updates the backdrop.
   * @param {object} [options] - Optional settings.
   * @param {string} [options.ownerId] - Unique owner ID. Auto-generated if omitted.
   * @param {string} [options.zIndexVar] - CSS z-index variable. Default: '--z-dropdown-backdrop'.
   * @param {number} [options.stackLevel] - Nesting level for stacked modals.
   * @param {function} [options.onClick] - Callback invoked on backdrop click.
   * @returns {string} The `ownerId` used to manage this backdrop request.
   */
  static insert (options = {}) {
    const finalOptions = {
      zIndexVar: '--z-dropdown-backdrop',
      stackLevel: null,
      onClick: null,
      ownerId: `backdrop-owner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...options
    };

    if (!this.#element) {
      this.#element = document.createElement('div');
      this.#element.id = 'singleton-js-backdrop';
      this.#element.className = 'backdrop';
      this.#element.addEventListener('click', this.#handleClick);
      document.body.appendChild(this.#element);
    }
    
    // Prevent duplicate entries for the same owner
    if (!this.#stack.some(owner => owner.ownerId === finalOptions.ownerId)) {
      this.#stack.push(finalOptions);
    }

    this.#updateStyle();
    
    // Add `is-visible` with a small delay to trigger the enter animation.
    // This ensures the browser registers the CSS transition correctly.
    globalThis.setTimeout(() => {
      if (this.#element) {
        this.#element.classList.add('is-visible');
      }
    }, 10);

    return finalOptions.ownerId;
  }

  /**
   * Withdraws a backdrop request.
   * @param {string} [ownerId] - Optional. If omitted, removes the most recent (top) request.
   */
  static remove (ownerId) {
    if (this.#stack.length === 0) return;

    if (ownerId) {
      this.#stack = this.#stack.filter(owner => owner.ownerId !== ownerId);
    } else {
      this.#stack.pop();
    }

    if (this.#stack.length > 0) {
      this.#updateStyle();
    } else if (this.#element) {
      // Stack is empty — start the exit animation
      this.#element.classList.remove('is-visible');
      
      // Listen for the animation to finish, then clean up.
      // `{ once: true }` auto-removes the listener after it fires.
      this.#element.addEventListener('transitionend', this.#handleTransitionEnd, { once: true });
    }
  }

  /**
   * Updates the backdrop's style based on the top owner's settings.
   */
  static #updateStyle () {
    if (!this.#element || this.#stack.length === 0) return;

    const topOwner = this.#stack[this.#stack.length - 1];
    const { zIndexVar, stackLevel = null } = topOwner;

    this.#element.style.zIndex = `var(${zIndexVar})`;
    
    if (stackLevel !== null) {
      this.#element.style.setProperty('--z-modal-stack-level', stackLevel);
    } else {
      this.#element.style.removeProperty('--z-modal-stack-level');
    }
  }
}

export default Backdrop;
