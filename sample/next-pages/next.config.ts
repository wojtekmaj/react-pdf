import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Critical: prevents "ESM packages (pdfjs-dist/build/pdf.worker.min.mjs) need to be imported." error
     */
    esmExternals: 'loose',
    // You may not need this, it's just to support moduleResolution: 'node16'
    extensionAlias: {
      '.js': ['.tsx', '.ts', '.jsx', '.js'],
    },
  },
};

export default nextConfig;
