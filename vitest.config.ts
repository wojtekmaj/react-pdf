// eslint-disable-next-line import/no-unresolved
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'src/index.test.js'],
    setupFiles: 'vitest.setup.ts',
  },
});
