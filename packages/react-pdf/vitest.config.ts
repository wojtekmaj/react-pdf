import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'src/index.test.ts'],
    pool: 'forks',
    setupFiles: 'vitest.setup.ts',
    watch: false,
  },
});
