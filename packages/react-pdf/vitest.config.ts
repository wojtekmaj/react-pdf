import { configDefaults, defineConfig } from 'vitest/config';

import type { ViteUserConfig } from 'vitest/config';

const config: ViteUserConfig = defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: 'playwright',
    },
    exclude: [...configDefaults.exclude, 'src/index.test.ts'],
    pool: 'forks',
    setupFiles: 'vitest.setup.ts',
    watch: false,
  },
});

export default config;
