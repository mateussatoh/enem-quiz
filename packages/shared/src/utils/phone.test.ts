import { describe, expect, it } from "vitest";
import { formatPhone, normalizeBrazilianPhone } from "./phone";

describe("normalizeBrazilianPhone", () => {
  it.each([
    ["(11) 98765-4321", "11987654321"],
    ["11987654321", "11987654321"],
    ["+55 21 98765-4321", "21987654321"],
    ["(31) 3456-7890", "3134567890"],
    ["5511987654321", "11987654321"],
    ["011 98765-4321", "11987654321"],
  ])("accepts %s", (input, expected) => {
    expect(normalizeBrazilianPhone(input)).toBe(expected);
  });

  it.each([
    ["98765-4321", "missing DDD"],
    ["(10) 98765-4321", "unassigned DDD"],
    ["(11) 88765-4321", "11-digit number not starting with 9"],
    ["(11) 9876-543", "too short"],
    ["(11) 1234-5678", "landline starting with 1"],
    ["", "empty"],
  ])("rejects %s (%s)", (input) => {
    expect(normalizeBrazilianPhone(input)).toBeNull();
  });
});

describe("formatPhone", () => {
  it("masks progressively", () => {
    expect(formatPhone("1")).toBe("(1");
    expect(formatPhone("119")).toBe("(11) 9");
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
    expect(formatPhone("3134567890")).toBe("(31) 3456-7890");
  });

  it("drops the country code or trunk zero when a full number is pasted", () => {
    expect(formatPhone("+55 11 98765-4321")).toBe("(11) 98765-4321");
    expect(formatPhone("+55 (31) 3456-7890")).toBe("(31) 3456-7890");
    expect(formatPhone("011987654321")).toBe("(11) 98765-4321");
  });
});
