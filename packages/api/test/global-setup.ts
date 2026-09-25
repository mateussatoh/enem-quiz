import { useTestEnv } from "./test-env";

export default async function setup() {
  useTestEnv();
  const { runMigrations } = await import("../src/db/migrate");
  const { seed } = await import("../src/db/seed");
  const { closeDb } = await import("../src/core/db");
  await runMigrations();
  await seed();
  await closeDb();
}
