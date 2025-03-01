// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

// Conditionally add setupDevPlatform for development
if (process.env.NODE_ENV === "development") {
  // Using dynamic import because setupDevPlatform uses await
  const setupEnvironment = async () => {
    try {
      const { setupDevPlatform } = await import("@cloudflare/next-on-pages/next-dev");
      await setupDevPlatform();
    } catch (error) {
      console.warn("Failed to setup development platform:", error);
    }
  };

  setupEnvironment();
}

module.exports = nextConfig;
