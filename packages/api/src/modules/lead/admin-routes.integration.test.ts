import { beforeAll, describe, expect, it } from "vitest";
import { app } from "../../app";
import { answersFor, fetchQuiz, json, loginCookie, post, resetLeads } from "../../../test/helpers";

let cookie: string;
const get = (path: string) => app.request(path, { headers: { cookie } });

beforeAll(async () => {
  await resetLeads();
  const quiz = await fetchQuiz();
  const submit = (name: string, email: string, pick: number) =>
    post("/api/quizzes/enem/submissions", {
      answers: answersFor(quiz, (i) => Math.min(pick, quiz.questions[i]!.options.length - 1)),
      lead: { name, email, phone: "11987654321" },
    });
  await submit("Bruno Lima", "bruno@email.com", 0); // 8 pts, starting
  await submit("Carla Dias", "carla@email.com", 3); // 100 pts, final_stretch
  await submit("Daniel 100%_Lima", "daniel@outro.com", 3);
  cookie = await loginCookie();
});

describe("admin auth", () => {
  it.each(["/api/admin/leads", "/api/admin/stats", "/api/admin/leads/export.csv"])(
    "%s returns 401 without a session",
    async (path) => {
      const res = await app.request(path);
      expect(res.status).toBe(401);
      expect((await json(res)).error.code).toBe("UNAUTHENTICATED");
    },
  );

  it("rejects a forged cookie", async () => {
    const res = await app.request("/api/admin/leads", {
      headers: { cookie: "quiz_admin_session=eyJhbGciOiJub25lIn0.e30." },
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for a wrong password", async () => {
    const res = await post("/api/auth/login", { email: "admin@test.dev", password: "errada" });
    expect(res.status).toBe(401);
    expect((await json(res)).error.code).toBe("INVALID_CREDENTIALS");
  });

  it("sets an httpOnly session cookie on login and exposes /me", async () => {
    const res = await post("/api/auth/login", {
      email: "ADMIN@test.dev",
      password: "senha-de-teste",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect((await get("/api/auth/me")).status).toBe(200);
  });
});

describe("GET /api/admin/leads", () => {
  it("lists newest first with pagination metadata", async () => {
    const body = await json(get("/api/admin/leads?pageSize=2"));
    expect(body).toMatchObject({ page: 1, pageSize: 2, total: 3, totalPages: 2 });
    expect(body.items.map((l: { name: string }) => l.name)).toEqual([
      "Daniel 100%_Lima",
      "Carla Dias",
    ]);
    expect(body.items[0]).not.toHaveProperty("ipHash");
  });

  it("searches by name or e-mail, case insensitive", async () => {
    const byName = await json(get("/api/admin/leads?q=bruno"));
    expect(byName.items.map((l: { email: string }) => l.email)).toEqual(["bruno@email.com"]);
    const byEmail = await json(get("/api/admin/leads?q=OUTRO.COM"));
    expect(byEmail.total).toBe(1);
  });

  it("treats LIKE wildcards in the search literally", async () => {
    const body = await json(get("/api/admin/leads?q=%25_"));
    expect(body.items.map((l: { name: string }) => l.name)).toEqual(["Daniel 100%_Lima"]);
  });

  it("filters by band", async () => {
    const body = await json(get("/api/admin/leads?band=final_stretch"));
    expect(body.total).toBe(2);
  });

  it("returns 400 for an unknown band", async () => {
    expect((await get("/api/admin/leads?band=nope")).status).toBe(400);
  });

  it("returns the lead detail with every answer", async () => {
    const list = await json(get("/api/admin/leads?q=carla"));
    const detail = await json(get(`/api/admin/leads/${list.items[0].id}`));
    expect(detail.answers).toHaveLength(10);
    expect(detail.answers[0]).toMatchObject({ position: 1, weight: 10 });
  });

  it("returns 404 for an unknown lead", async () => {
    const res = await get("/api/admin/leads/00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
  });
});

describe("admin extras", () => {
  it("aggregates stats", async () => {
    const stats = await json(get("/api/admin/stats"));
    expect(stats.total).toBe(3);
    expect(stats.byBand).toEqual([
      { key: "starting", label: "Ponto de partida", count: 1 },
      { key: "building", label: "Em construção", count: 0 },
      { key: "on_track", label: "Bom caminho", count: 0 },
      { key: "final_stretch", label: "Reta final", count: 2 },
    ]);
    expect(stats.byDay).toHaveLength(30);
    expect(stats.byDay.at(-1).count).toBe(3);
  });

  it("exports the filtered leads as CSV", async () => {
    const res = await get("/api/admin/leads/export.csv?band=starting");
    expect(res.headers.get("content-type")).toContain("text/csv");
    const lines = (await res.text()).trim().split("\r\n");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("bruno@email.com");
  });
});
