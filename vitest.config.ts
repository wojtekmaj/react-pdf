import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'src/index.test.ts'],
    setupFiles: 'vitest.setup.ts',
    threads: false,
  },
});
