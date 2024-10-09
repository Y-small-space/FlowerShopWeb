/** @type {import('next').NextConfig} */
const nextConfig = {
  // webpack(config) {
  //   config.module.rules.push({
  //     test: /\.css$/,
  //     use: ['style-loader', 'css-loader'],
  //   });

  //   return config;
  // },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  }
};

export default nextConfig;
