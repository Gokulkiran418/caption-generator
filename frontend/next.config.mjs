/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Only required if you're using experimental features
    // appDir: true, // Uncomment if you're using the `/app` directory
  },
  allowedDevOrigins: [
    'http://192.168.1.7:3000',
    'http://localhost:3000',
  ],
};

export default nextConfig;
