/**
 * @summary Static viewport dimension helpers.
 */
class Viewport {
  /**
   * Prints available methods and descriptions to the console.
   */
  static help () {
    const availableConfigs = new Map([
      ['getDimensions()', 'Returns the viewport width and height as a `{ width, height }` object.'],
      ['getWidth()', 'Returns only the viewport width.'],
      ['getHeight()', 'Returns only the viewport height.'],
      ['aspectRatio()', 'Returns the viewport aspect ratio (width / height).']
    ]);
    console.info('%cViewport', 'font-size: 20px; font-weight: bold; color: red');
    availableConfigs.forEach((value, key) => {
      console.info(`%c${key}: %c${value}`, 'font-weight: bold; color: red', 'font-weight: normal; color: unset');
    });
  }

  /**
   * Returns the current viewport width and height.
   * @returns {{width: number, height: number}} Viewport dimensions.
   */
  static getDimensions () {
    // Standard and reliable methods for modern browsers.
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    
    return { width, height };
  }

  /**
   * Returns the viewport width.
   * @returns {number} Width (pixels).
   */
  static getWidth () {
    return this.getDimensions().width;
  }

  /**
   * Returns the viewport height.
   * @returns {number} Height (pixels).
   */
  static getHeight () {
    return this.getDimensions().height;
  }

  /**
   * Calculates the viewport aspect ratio.
   * @returns {number} Aspect ratio (width / height).
   */
  static aspectRatio () {
    const { width, height } = this.getDimensions();
    // Prevent division by zero
    if (height === 0) return 0;
    
    return width / height;
  }
}

export default Viewport;