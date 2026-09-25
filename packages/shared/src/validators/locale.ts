import { z } from "zod";

/**
 * Built-in zod messages (enum, number, uuid...) in Portuguese, so no English leaks to users.
 * Custom messages in the schemas still take precedence. An explicit call, not an import side
 * effect: bundlers tree-shake side-effect-only imports from this package.
 */
export function setZodLocalePtBR() {
  z.config(z.locales.pt());
}
