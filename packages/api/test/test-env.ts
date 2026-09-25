import { loadRootEnv } from "../src/core/load-env";

/** Points the API at the dedicated test database before anything opens a connection. */
export function useTestEnv() {
  loadRootEnv();
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is required for API tests (see .env.example)");
  process.env.DATABASE_URL = url;
  process.env.SESSION_SECRET ??= "test-secret-test-secret-test-secret-000";
  process.env.ADMIN_EMAIL = "admin@test.dev";
  process.env.ADMIN_PASSWORD = "senha-de-teste";
}
