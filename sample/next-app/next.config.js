/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {

    // This part is creating error when using firebase together
    // config.module.rules.push({
    //   test: /\.node/,
    //   use: "raw-loader",
    // });

    // @FIX
    // This is to suspend unwanted error because canvas cannot be found because (Server Side Rendering)
    // because when trying to use other library like firebase it does not make Re-export error
    config.resolve.alias.canvas = false;
    
    return config;
  },
};

export default nextConfig;
