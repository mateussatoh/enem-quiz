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
};

export default nextConfig;
