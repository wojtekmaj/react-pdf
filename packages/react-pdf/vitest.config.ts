import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'src/index.test.ts'],
    server: {
      deps: {
        inline: ['vitest-canvas-mock'],
      },
    },
    setupFiles: 'vitest.setup.ts',
    threads: false,
    watch: false,
  },
});
