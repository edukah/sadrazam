/**
 * @summary Top loading bar with reference counting and trickle animation.
 */
class ProgressBar {
  // --- Private Static Fields ---
  static #element = null;
  static #referenceCount = 0;
  static #intervalId = null;
  static #currentProgress = 0;

  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableMethods = new Map([
      ['start()', 'Shows the bar and starts trickle progress. Supports multiple calls (reference counting).'],
      ['done()', 'Withdraws a reference. On the last reference, completes to 100% and hides.'],
      ['set(n)', 'Sets progress manually. Takes a 0–1 value (e.g. 0.5 = 50%).']
    ]);
    console.info('%cProgressBar', 'font-size: 20px; font-weight: bold; color: red');
    availableMethods.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Creates the bar (if needed) and starts trickle progress.
   */
  static start () {
    this.#referenceCount++;

    if (!this.#element) {
      this.#currentProgress = 0;
      this.#element = document.createElement('div');
      this.#element.className = 'progress-bar';
      this.#element.style.width = '0%';
      document.body.appendChild(this.#element);

      // Force reflow to ensure initial width:0 is applied before transition
      this.#element.offsetWidth;

      this.#element.classList.add('is-active');
      this.#startTrickle();
    }
  }

  /**
   * Withdraws a reference. When none remain, completes to 100% and hides.
   */
  static done () {
    if (this.#referenceCount > 0) {
      this.#referenceCount--;
    }

    if (this.#referenceCount === 0 && this.#element) {
      this.#stopTrickle();
      this.set(1);

      const el = this.#element;

      // Wait for width transition to 100%, then fade out
      window.setTimeout(() => {
        el.classList.remove('is-active');

        // Wait for opacity transition, then remove
        window.setTimeout(() => {
          el.remove();
          if (this.#element === el) {
            this.#element = null;
            this.#currentProgress = 0;
          }
        }, 300);
      }, 300);
    }
  }

  /**
   * Sets progress manually.
   * @param {number} n — Value between 0–1 (e.g. 0.5 = 50%)
   */
  static set (n) {
    const value = Math.max(0, Math.min(1, n));
    this.#currentProgress = value;

    if (this.#element) {
      this.#element.style.width = (value * 100) + '%';
    }
  }

  /**
   * Starts trickle progress. Fast initially, very slow after 80%.
   */
  static #startTrickle () {
    this.#stopTrickle();

    this.#intervalId = window.setInterval(() => {
      const p = this.#currentProgress;
      let increment;

      if (p < 0.2) {
        increment = 0.05;
      } else if (p < 0.5) {
        increment = 0.03;
      } else if (p < 0.8) {
        increment = 0.015;
      } else if (p < 0.95) {
        increment = 0.003;
      } else {
        // Progress stops after 95% — waits for done()
        this.#stopTrickle();

        return;
      }

      this.set(p + increment);
    }, 200);
  }

  /**
   * Clears the trickle interval.
   */
  static #stopTrickle () {
    if (this.#intervalId) {
      window.clearInterval(this.#intervalId);
      this.#intervalId = null;
    }
  }
}

export default ProgressBar;
