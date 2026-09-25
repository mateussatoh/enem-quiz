import { Resend } from "resend";
import { env } from "./env";
import { logEvent } from "./logger";

export type EmailMessage = { to: string; subject: string; html: string; text: string; tag: string };
export type EmailResult =
  { sent: true; id: string } | { sent: false; reason: "disabled" | "failed" };

let client: Resend | undefined;

/**
 * Transactional e-mail capability. Never throws: callers run it after the response and a
 * delivery problem must not surface as a failed submission.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const { RESEND_API_KEY, EMAIL_FROM } = env();
  if (!RESEND_API_KEY) {
    logEvent("info", "email.skipped", { tag: message.tag, reason: "RESEND_API_KEY not set" });
    return { sent: false, reason: "disabled" };
  }

  client ??= new Resend(RESEND_API_KEY);
  try {
    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      tags: [{ name: "category", value: message.tag }],
    });
    if (error || !data) throw new Error(error?.message ?? "empty response");
    logEvent("info", "email.sent", { tag: message.tag, id: data.id });
    return { sent: true, id: data.id };
  } catch (err) {
    logEvent("error", "email.failed", { tag: message.tag, message: (err as Error).message });
    return { sent: false, reason: "failed" };
  }
}
