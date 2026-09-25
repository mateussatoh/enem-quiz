import { migrate } from "drizzle-orm/postgres-js/migrator";
import { resolve } from "node:path";
import { loadRootEnv } from "../core/load-env";

loadRootEnv();

const { closeDb, db } = await import("../core/db");

export async function runMigrations() {
  await migrate(db(), { migrationsFolder: resolve(import.meta.dirname, "../../drizzle") });
}

if (import.meta.main) {
  await runMigrations();
  console.log("Migrations applied");
  await closeDb();
}
