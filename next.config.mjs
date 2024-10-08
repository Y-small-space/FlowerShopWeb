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
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 增大请求体限制
    },
  },
};

export default nextConfig;
