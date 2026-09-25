import { z } from "zod";

// Built-in zod messages (enum, number, uuid...) in Portuguese, so no English leaks to users.
// Custom messages in the schemas still take precedence.
z.config(z.locales.pt());
