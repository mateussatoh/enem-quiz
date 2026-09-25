import type { SubmissionResult } from "@enem-quiz/shared/types";

const BAND_COLORS: Record<SubmissionResult["band"]["key"], string> = {
  starting: "#c4502f",
  building: "#a86a12",
  on_track: "#2a66c0",
  final_stretch: "#1b7f53",
};

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!,
  );

/**
 * Diagnostic e-mail sent to the lead. Table layout and inline styles on purpose: that is what
 * renders consistently across Gmail, Outlook and phone clients.
 */
export function renderResultEmail(result: SubmissionResult, resultUrl: string) {
  const name = escapeHtml(result.firstName);
  const color = BAND_COLORS[result.band.key];
  const subject = `${result.firstName}, seu diagnóstico ENEM: ${result.score}/100 (${result.band.label})`;

  const answersHtml = result.answers
    .map(
      (a) => `
        <tr>
          <td style="padding:12px 0;border-top:1px solid #e2e5ee;font-size:13px;color:#636c85">
            ${a.position}. ${escapeHtml(a.question)}
            <div style="margin-top:4px;font-size:15px;color:#151d35;font-weight:600">${escapeHtml(a.answer)}</div>
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background:#f7f6f2;font-family:Helvetica,Arial,sans-serif;color:#151d35">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f2;padding:24px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e5ee;border-radius:16px;padding:32px 28px">
          <tr><td style="font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#2340d6">Diagnóstico ENEM</td></tr>
          <tr><td style="padding-top:12px;font-size:24px;line-height:1.3;font-family:Georgia,serif">Olá, ${name}! Seu diagnóstico está pronto.</td></tr>
          <tr><td align="center" style="padding:28px 0 8px">
            <div style="font-size:64px;line-height:1;font-family:Georgia,serif;color:${color}">${result.score}</div>
            <div style="font-size:13px;color:#636c85;padding-top:4px">de 100 pontos</div>
            <div style="display:inline-block;margin-top:14px;padding:6px 14px;border-radius:999px;border:1px solid ${color};color:${color};font-size:13px;font-weight:700">${escapeHtml(result.band.label)}</div>
          </td></tr>
          <tr><td align="center" style="padding:12px 8px 24px;font-size:18px;line-height:1.5;font-family:Georgia,serif">${escapeHtml(result.band.message)}</td></tr>
          <tr><td align="center" style="padding-bottom:28px">
            <a href="${escapeHtml(resultUrl)}" style="display:inline-block;background:#ffb938;color:#151d35;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:10px">Ver meu diagnóstico completo</a>
          </td></tr>
          <tr><td style="font-size:16px;font-weight:700;padding-bottom:4px">Suas respostas</td></tr>
          ${answersHtml}
          <tr><td style="padding-top:24px;font-size:12px;line-height:1.5;color:#636c85">
            Um especialista vai falar com você pelo WhatsApp com um plano de estudos para a sua faixa.<br />
            Você recebeu este e-mail porque respondeu ao quiz de diagnóstico ENEM.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    `Olá, ${result.firstName}! Seu diagnóstico ENEM está pronto.`,
    "",
    `Pontuação: ${result.score}/100`,
    `Faixa: ${result.band.label}`,
    result.band.message,
    "",
    `Veja o diagnóstico completo: ${resultUrl}`,
    "",
    "Suas respostas:",
    ...result.answers.map((a) => `${a.position}. ${a.question}\n   ${a.answer}`),
  ].join("\n");

  return { subject, html, text };
}
