import { describe, expect, it } from "vitest";
import { leadSchema } from "./lead";

const valid = { name: "  Ana   Souza ", email: " Ana@Email.com ", phone: "(11) 98765-4321" };

describe("leadSchema", () => {
  it("normalizes a valid lead", () => {
    expect(leadSchema.parse(valid)).toEqual({
      name: "Ana Souza",
      email: "ana@email.com",
      phone: "11987654321",
    });
  });

  it.each([
    ["name", "Al", "O nome precisa ter pelo menos 3 caracteres"],
    ["name", "   ", "O nome precisa ter pelo menos 3 caracteres"],
    ["name", "123", "Informe um nome válido"],
    ["email", "ana@", "E-mail inválido"],
    ["email", "ana.com", "E-mail inválido"],
    ["phone", "98765-4321", "Telefone inválido. Use DDD + número"],
  ])("rejects invalid %s %j", (field, value, message) => {
    const result = leadSchema.safeParse({ ...valid, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
    expect(result.error?.issues[0]?.message).toBe(message);
  });

  it("requires every field", () => {
    const result = leadSchema.safeParse({});
    expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual(["email", "name", "phone"]);
  });
});
