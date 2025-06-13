import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // You may not need this, it's just to support moduleResolution: 'node16'
    extensionAlias: {
      '.js': ['.tsx', '.ts', '.jsx', '.js'],
    },
  },
};

export default nextConfig;
