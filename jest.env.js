/**
 * Workaround for https://github.com/facebook/jest/issues/7780
 */

const JSDOMEnvironment = require('jest-environment-jsdom');

class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super({
      ...config,
      globals: {
        ...config.globals,
        Uint32Array,
        Uint8Array,
        ArrayBuffer,
      },
    });
  }
}

module.exports = CustomJSDOMEnvironment;
