import { defineConfig } from "drizzle-kit";
import { loadRootEnv } from "./src/core/load-env";

loadRootEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/modules/*/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
  casing: "snake_case",
});
