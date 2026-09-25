import { describe, expect, it } from "vitest";
import { csvCell, leadsToCsv } from "./csv";

describe("csv", () => {
  it("quotes cells and escapes quotes", () => {
    expect(csvCell('Ana "Aninha"')).toBe('"Ana ""Aninha"""');
  });

  it("neutralizes spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe(`"'=HYPERLINK(1)"`);
    expect(csvCell("+5511")).toBe(`"'+5511"`);
  });

  it("renders a BOM, header and formatted rows", () => {
    const csv = leadsToCsv([
      {
        id: "x",
        quizId: 1,
        name: "Ana",
        email: "ana@email.com",
        phone: "11987654321",
        score: 72,
        band: "on_track",
        ipHash: null,
        createdAt: new Date("2026-09-25T15:00:00Z"),
      },
    ]);
    const [header, row] = csv.slice(1).split("\r\n");
    expect(csv.charCodeAt(0) === 0xfeff).toBe(true);
    expect(header).toBe('"Nome";"E-mail";"Telefone";"Pontuação";"Faixa";"Data de cadastro"');
    expect(row).toBe(
      '"Ana";"ana@email.com";"(11) 98765-4321";"72";"Bom caminho";"25/09/2026, 12:00"',
    );
  });
});
