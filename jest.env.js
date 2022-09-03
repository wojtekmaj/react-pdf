/**
 * Workaround for https://github.com/facebook/jest/issues/7780
 */

const { TestEnvironment: JSDOMEnvironment } = require('jest-environment-jsdom');

class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor({ globalConfig, projectConfig }, context) {
    super(
      {
        globalConfig,
        projectConfig: {
          ...projectConfig,
          globals: {
            ...projectConfig.globals,
            ArrayBuffer,
          },
        },
      },
      context,
    );
  }
}

module.exports = CustomJSDOMEnvironment;
