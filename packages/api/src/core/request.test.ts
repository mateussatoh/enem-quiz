import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { clientIp } from "./request";

const socket = { incoming: { socket: { remoteAddress: "10.0.0.9" } } };
async function ipWith(trustProxy: boolean, headers: Record<string, string>) {
  const app = new Hono().get("/", (c) => c.text(clientIp(c, trustProxy) ?? "none"));
  const res = await app.request("/", { headers }, socket);
  return res.text();
}

describe("clientIp", () => {
  it("uses the forwarding header behind a trusted proxy", async () => {
    expect(await ipWith(true, { "x-forwarded-for": "203.0.113.7, 10.0.0.1" })).toBe("203.0.113.7");
  });

  it("ignores spoofable headers without a trusted proxy and uses the socket", async () => {
    expect(await ipWith(false, { "x-forwarded-for": "1.2.3.4" })).toBe("10.0.0.9");
  });
});
