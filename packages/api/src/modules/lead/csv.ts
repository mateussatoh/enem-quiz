import { getBandByKey } from "@enem-quiz/shared/domain";
import { formatPhone } from "@enem-quiz/shared/utils";
import type { leads } from "./schema";

type LeadRow = typeof leads.$inferSelect;

// Semicolon + BOM: what Excel in pt-BR opens correctly with a double click.
const SEPARATOR = ";";
const BOM = String.fromCharCode(0xfeff);
const HEADER = ["Nome", "E-mail", "Telefone", "Pontuação", "Faixa", "Data de cadastro"];

/** Quotes the cell and neutralizes spreadsheet formula injection (=, +, -, @ prefixes). */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
});

export function leadsToCsv(rows: LeadRow[]): string {
  const lines = [HEADER.map(csvCell).join(SEPARATOR)];
  for (const lead of rows) {
    lines.push(
      [
        lead.name,
        lead.email,
        formatPhone(lead.phone),
        lead.score,
        getBandByKey(lead.band).label,
        dateFormatter.format(lead.createdAt),
      ]
        .map(csvCell)
        .join(SEPARATOR),
    );
  }
  return `${BOM}${lines.join("\r\n")}\r\n`;
}
