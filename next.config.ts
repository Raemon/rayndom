import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // generateForYou reads scripts/interestFilterPrompt.md via a runtime path that
  // Next's file tracing can't see statically; include it so it ships in the bundle.
  outputFileTracingIncludes: {
    '/api/cron/observatory-daily': ['./scripts/interestFilterPrompt.md'],
    '/api/observatory/generate-foryou': ['./scripts/interestFilterPrompt.md'],
  },
  async redirects() {
    return [
      { source: '/logging/zen', destination: '/logging', permanent: false },
    ]
  },
};

export default nextConfig;
