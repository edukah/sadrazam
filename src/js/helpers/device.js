/**
 * @summary Static device capability detector for touch support.
 */
class Device {
  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['isTouch()', 'Checks if the device has a touch screen. Returns `true` or `false`.']
    ]);
    console.info('%cDevice', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Checks if the device has touch capability using multiple detection methods.
   * @returns {boolean} true if touch-capable, false otherwise.
   */
  static isTouch () {
    // 1. Check for 'ontouchstart' event (broad compatibility)
    const hasTouchStart = 'ontouchstart' in window;

    // 2. Check Navigator.maxTouchPoints (modern and reliable)
    // Non-touch devices return 0.
    const hasTouchPoints = globalThis.navigator.maxTouchPoints > 0;

    // 3. Check if the primary pointer is "coarse" via media query (future-proof)
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    return hasTouchStart || hasTouchPoints || isCoarsePointer;
  }
}

export default Device;