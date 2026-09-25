import { describe, expect, it } from "vitest";
import { json } from "../test/helpers";
import { app } from "./app";

const rawPost = (path: string, body: string) =>
  app.request(path, { method: "POST", headers: { "content-type": "application/json" }, body });

describe("app error handling", () => {
  it.each(["/api/quizzes/enem/submissions", "/api/auth/login"])(
    "answers 400 VALIDATION for a malformed JSON body on %s",
    async (path) => {
      const res = await rawPost(path, "{nao e json");
      expect(res.status).toBe(400);
      expect((await json(res)).error).toEqual({
        code: "VALIDATION",
        message: "Corpo da requisição inválido. Envie um JSON válido",
      });
    },
  );

  it("answers 404 with the error shape for unknown routes", async () => {
    const res = await app.request("/api/nao-existe");
    expect(res.status).toBe(404);
    expect((await json(res)).error.code).toBe("NOT_FOUND");
  });
});
