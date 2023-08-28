import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        html: '<!DOCTYPE html><html><body style="--react-pdf-annotation-layer: 1;--react-pdf-text-layer: 1;"></body></html>',
      },
    },
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
