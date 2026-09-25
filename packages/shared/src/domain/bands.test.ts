import { describe, expect, it } from "vitest";
import { BANDS, getBand } from "./bands";

describe("getBand", () => {
  it.each([
    [0, "starting"],
    [30, "starting"],
    [31, "building"],
    [55, "building"],
    [56, "on_track"],
    [80, "on_track"],
    [81, "final_stretch"],
    [100, "final_stretch"],
  ])("maps score %i to %s", (score, key) => {
    expect(getBand(score).key).toBe(key);
  });

  it("covers 0..100 without gaps or overlaps", () => {
    for (let s = 0; s <= 100; s++) {
      expect(BANDS.filter((b) => s >= b.min && s <= b.max)).toHaveLength(1);
    }
  });

  it("rejects scores outside the range", () => {
    expect(() => getBand(101)).toThrow(RangeError);
    expect(() => getBand(-1)).toThrow(RangeError);
  });
});
