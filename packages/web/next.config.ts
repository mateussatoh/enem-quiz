import type { NextConfig } from "next";
import { resolve } from "node:path";

// Local dev shares one .env at the repo root with the API scripts. Vercel injects env directly.
try {
  process.loadEnvFile(resolve(import.meta.dirname, "../../.env"));
} catch {
  // no root .env: fine in CI and on Vercel
}

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source; Next compiles them.
  transpilePackages: ["@enem-quiz/shared", "@enem-quiz/api"],
  poweredByHeader: false,
  typedRoutes: true,
  // PostHog reverse proxy: analytics go through our own domain.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
    const assets = host
      .replace("://us.i.", "://us-assets.i.")
      .replace("://eu.i.", "://eu-assets.i.");
    return [
      { source: "/ingest/static/:path*", destination: `${assets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${host}/:path*` },
    ];
  },
};

export default nextConfig;
