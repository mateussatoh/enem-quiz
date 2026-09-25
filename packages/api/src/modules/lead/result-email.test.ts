import type { SubmissionResult } from "@enem-quiz/shared/types";
import { describe, expect, it } from "vitest";
import { renderResultEmail } from "./result-email";

const result: SubmissionResult = {
  resultId: "abc",
  firstName: "Ana",
  score: 72,
  band: { key: "on_track", label: "Bom caminho", message: "Sua preparação está sólida." },
  answers: [{ position: 1, question: "Em que etapa?", answer: "Estou no 3º ano" }],
};

describe("renderResultEmail", () => {
  it("summarizes score, band, answers and the result link", () => {
    const email = renderResultEmail(result, "https://app.test/resultado/abc");
    expect(email.subject).toBe("Ana, seu diagnóstico ENEM: 72/100 (Bom caminho)");
    for (const part of ["72", "Bom caminho", "Sua preparação está sólida.", "Estou no 3º ano"]) {
      expect(email.html).toContain(part);
      expect(email.text).toContain(part);
    }
    expect(email.html).toContain('href="https://app.test/resultado/abc"');
  });

  it("escapes user-provided content in the HTML", () => {
    const email = renderResultEmail(
      { ...result, firstName: '<img src=x onerror="alert(1)">' },
      "https://app.test/r",
    );
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });
});
