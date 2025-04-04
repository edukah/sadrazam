if (typeof globalThis === 'undefined') {
  (function () {
    const getGlobal = function () {
      /* eslint-disable-next-line no-undef */
      if (typeof self !== 'undefined') { return self; }

      if (typeof window !== 'undefined') { return window; }
      /* eslint-disable-next-line no-undef */
      if (typeof global !== 'undefined') { return global; }
      // fallback: Function constructor hack

      return Function('return this')();
    };
    const globalObj = getGlobal();
    globalObj.globalThis = globalObj;
  })();
}
