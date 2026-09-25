import { afterAll } from "vitest";
import { useTestEnv } from "./test-env";

useTestEnv();

afterAll(async () => {
  const { closeDb } = await import("../src/core/db");
  await closeDb();
});
