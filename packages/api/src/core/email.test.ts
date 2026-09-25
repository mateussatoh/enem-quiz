import { describe, expect, it } from "vitest";
import { sendEmail } from "./email";

describe("sendEmail", () => {
  it("is a logged no-op when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await sendEmail({
      to: "a@b.com",
      subject: "s",
      html: "<p>h</p>",
      text: "h",
      tag: "t",
    });
    expect(result).toEqual({ sent: false, reason: "disabled" });
  });
});
