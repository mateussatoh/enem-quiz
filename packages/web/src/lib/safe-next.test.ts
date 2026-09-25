import { describe, expect, it } from "vitest";
import { safeAdminNext } from "./safe-next";

describe("safeAdminNext", () => {
  it.each([
    ["/admin/leads?faixa=on_track", "/admin/leads?faixa=on_track"],
    ["/admin", "/admin"],
    [null, "/admin"],
    ["https://evil.test/admin", "/admin"],
    ["//evil.test/admin", "/admin"],
    ["/administrator", "/admin"],
    ["/admin/login?next=/admin", "/admin"],
  ])("%s -> %s", (input, expected) => {
    expect(safeAdminNext(input)).toBe(expected);
  });
});
