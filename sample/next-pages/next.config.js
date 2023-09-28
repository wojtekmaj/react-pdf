/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // You may not need this, it's just to support moduleResolution: 'node16'
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };

    return config;
  },
};

export default nextConfig;
