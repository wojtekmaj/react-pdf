import type { NextConfig } from 'next';

const turbopackEnabled = process.env.TURBOPACK;

const nextConfig: NextConfig = {
  experimental: turbopackEnabled
    ? undefined
    : {
        /**
         * Prevents "ESM packages (pdfjs-dist/build/pdf.worker.min.mjs) need to be imported." error in Webpack builds
         */
        esmExternals: 'loose',
      },
};

export default nextConfig;
