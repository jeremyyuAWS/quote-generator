/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Only ignore type checking in production builds
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    // Apply development-specific optimizations
    if (dev) {
      // Disable cache in development to prevent ENOENT errors
      config.cache = false;
      
      // More aggressive cache handling in development
      if (config.watchOptions) {
        config.watchOptions.ignored = ['**/node_modules/**', '**/.next/cache/**'];
      } else {
        config.watchOptions = {
          ignored: ['**/node_modules/**', '**/.next/cache/**'],
        };
      }
      
      // Disable minimization in development to reduce memory usage
      config.optimization = {
        ...config.optimization,
        minimize: false
      };
      
      // Reduce parallel operations in development
      if (config.infrastructureLogging) {
        config.infrastructureLogging.level = 'error';
      }
    }

    // Add specific handling for problematic modules
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      }
    });
    
    return config;
  },
  // Use standalone output to optimize for deployment
  output: 'standalone',
  // Add production optimizations
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: false, // Disable SWC minification to avoid potential issues
};

module.exports = nextConfig;