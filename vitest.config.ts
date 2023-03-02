// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environment: 'jsdom',
    setupFiles: 'vitest.setup.ts',
  },
});
