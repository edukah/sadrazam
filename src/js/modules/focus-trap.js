/**
 * @summary Singleton focus trap manager with stack-based ownership.
 * @description Keeps keyboard focus inside a modal layer. Owns Tab handling and focus
 *   restoration ONLY — Escape stays with the component, because closing on Escape is a
 *   per-component decision (a modal closes, a consent layer must not).
 *
 *   Mirrors Backdrop and Elem's scroll lock: owner IDs, not a bare count. The three form
 *   the modality toolkit and a component composes the ones it needs — a dropdown wants a
 *   backdrop only, a slide-in panel wants a backdrop plus a scroll lock, a blocking dialog
 *   wants all three.
 */
class FocusTrap {
  // --- Private Static Fields ---
  static #stack = [];

  static #FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableMethods = new Map([
      ['insert(element, ownerId?)', 'Traps Tab inside `element` and focuses its first focusable child. Returns an `ownerId`.'],
      ['remove(ownerId)', 'Releases the trap and restores focus to wherever it was before.']
    ]);
    console.info('%cFocusTrap', 'font-size: 20px; font-weight: bold; color: red');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Traps keyboard focus inside an element.
   * @param {HTMLElement} element - The layer to trap focus in.
   * @param {string} [ownerId] - Unique owner ID. Auto-generated if omitted. Re-trapping with the
   *   same ID is a no-op, so callers reached from more than one path stay idempotent.
   * @returns {string|null} The `ownerId` to pass back to `remove()`, or null if no element.
   */
  static insert (element, ownerId) {
    if (!(element instanceof globalThis.Element)) {
      console.warn('[Sadrazam|FocusTrap] insert: a valid element is required.');

      return null;
    }

    const finalOwnerId = ownerId ?? `focus-trap-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (this.#stack.some(owner => owner.ownerId === finalOwnerId)) {
      return finalOwnerId;
    }

    this.#stack.push({ ownerId: finalOwnerId, element, previouslyFocused: document.activeElement });

    if (this.#stack.length === 1) {
      document.addEventListener('keydown', this.#handleKeydown);
    }

    this.#focusFirst(element);

    return finalOwnerId;
  }

  /**
   * Releases one trap. Focus is restored only when the topmost trap is released.
   * @param {string} ownerId - The ID returned by `insert()`. Releasing a trap you do not own is ignored.
   */
  static remove (ownerId) {
    if (!ownerId) return;

    const index = this.#stack.findIndex(owner => owner.ownerId === ownerId);

    if (index === -1) return;

    const wasTopmost = index === this.#stack.length - 1;

    const [owner] = this.#stack.splice(index, 1);

    if (this.#stack.length === 0) {
      document.removeEventListener('keydown', this.#handleKeydown);
    }

    // A layer below the top was released out of order — a higher layer is still open
    // and owns focus. Restoring here would pull focus behind a layer the user can still
    // see. The remaining top keeps the focus it already has.
    if (!wasTopmost) return;

    // Restore focus only if the element is still in the document — it may have been
    // removed while the layer was open.
    if (owner.previouslyFocused && document.body.contains(owner.previouslyFocused)) {
      owner.previouslyFocused.focus();
    }
  }

  /**
   * Keeps Tab cycling inside the topmost trapped layer.
   */
  static #handleKeydown = (event) => {
    if (event.key !== 'Tab' || this.#stack.length === 0) return;

    const topOwner = this.#stack[this.#stack.length - 1];
    const focusable = this.#focusable(topOwner.element);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Focus escaped the layer — pull it back. Happens when the focused control is hidden
    // while the layer is open (a layer that swaps between two views does exactly this),
    // which drops focus to <body> and would otherwise let the next Tab land behind the layer.
    if (!topOwner.element.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();

      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /**
   * Visible, focusable descendants in DOM order.
   */
  static #focusable (element) {
    return [...element.querySelectorAll(this.#FOCUSABLE_SELECTOR)]
      .filter(candidate => this.#isVisible(candidate, element));
  }

  /**
   * Walks up the ancestor chain looking for `display: none` / `visibility: hidden`.
   *
   * NOT `checkVisibility()` and NOT `offsetParent`: jsdom implements neither usefully —
   * `checkVisibility` is undefined there and `offsetParent` is null for visible and hidden
   * elements alike (no layout engine). Measured: only the ANCESTOR reports `display: none`,
   * the descendant still reports its own value. This walk gives one code path that behaves
   * the same in jsdom and in a real browser, so the tests exercise what ships.
   */
  static #isVisible (element, root) {
    let node = element;

    while (node instanceof globalThis.Element) {
      const style = globalThis.getComputedStyle(node);

      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }

      if (node === root) break;

      node = node.parentElement;
    }

    return true;
  }

  /**
   * Moves focus into the layer (ARIA APG: focus must enter the dialog when it opens).
   * Falls back to the layer itself when it holds nothing focusable.
   */
  static #focusFirst (element) {
    const focusable = this.#focusable(element);

    if (focusable.length > 0) {
      focusable[0].focus();

      return;
    }

    element.setAttribute('tabindex', '-1');
    element.focus();
  }
}

export default FocusTrap;
