import { describe, expect, it } from "vitest";
import { calculateScore } from "./score";

describe("calculateScore", () => {
  it("sums the chosen weights", () => {
    expect(calculateScore([10, 7, 3, 0, 2])).toBe(22);
  });

  it("returns 100 when every best answer is chosen", () => {
    expect(calculateScore(Array(10).fill(10))).toBe(100);
  });

  it("returns 0 for no weights", () => {
    expect(calculateScore([])).toBe(0);
  });

  it("clamps to the 0..100 contract", () => {
    expect(calculateScore([60, 60])).toBe(100);
    expect(calculateScore([-5])).toBe(0);
  });
});
