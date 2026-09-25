import type { AdminSession } from "@enem-quiz/shared/types";

export type AppEnv = {
  Variables: {
    admin: AdminSession;
  };
};
