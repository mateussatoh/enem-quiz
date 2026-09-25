import { resolve } from "node:path";

/** Loads the repo-root .env for CLI scripts (migrate, seed, drizzle-kit). No-op when absent. */
export function loadRootEnv() {
  try {
    process.loadEnvFile(resolve(import.meta.dirname, "../../../../.env"));
  } catch {
    // Deployed environments inject variables directly.
  }
}
