import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Layer boundaries: shared is pure (no api/web), api never reaches into web.
const restrict = (patterns) => ({
  "no-restricted-imports": [
    "error",
    { patterns: patterns.map((group) => ({ group, message: "Layer boundary: see AGENTS.md" })) },
  ],
});

export default tseslint.config(
  {
    ignores: [
      "**/node_modules",
      "**/.next",
      "**/drizzle",
      "**/next-env.d.ts",
      "playwright-report",
      "test-results",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["packages/shared/**"],
    rules: restrict([
      ["@enem-quiz/api*", "@enem-quiz/web*", "drizzle-orm*", "hono*", "react*", "next*"],
    ]),
  },
  {
    files: ["packages/api/**"],
    rules: restrict([["@enem-quiz/web*", "react*", "next*"]]),
  },
  {
    files: ["packages/web/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // web talks to the API over HTTP only; the single exception is the route that mounts it.
      ...restrict([
        ["@enem-quiz/api", "@enem-quiz/api/*", "!@enem-quiz/api/app", "drizzle-orm*", "postgres"],
      ]),
    },
  },
  {
    files: ["**/scripts/**", "packages/api/src/db/seed.ts", "packages/api/src/db/migrate.ts"],
    rules: { "no-console": "off" },
  },
);
