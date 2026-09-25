import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { env } from "./env";

function createDb(url: string) {
  // prepare:false keeps us compatible with transaction poolers (Neon/pgbouncer) in serverless.
  const client = postgres(url, { max: 5, prepare: false, onnotice: () => {} });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

// Survive Next dev hot reloads without leaking connections.
const globalForDb = globalThis as unknown as { __quizDb?: Db };

export function db(): Db {
  globalForDb.__quizDb ??= createDb(env().DATABASE_URL);
  return globalForDb.__quizDb;
}

export async function closeDb() {
  await globalForDb.__quizDb?.$client.end();
  globalForDb.__quizDb = undefined;
}
