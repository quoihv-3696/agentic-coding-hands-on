import { describe, it, expect } from "vitest";
import { starCountFor, STAR_THRESHOLDS } from "./stars";

describe("stars", () => {
  describe("starCountFor", () => {
    it("returns 0 for counts below 10", () => {
      expect(starCountFor(0)).toBe(0);
      expect(starCountFor(5)).toBe(0);
      expect(starCountFor(9)).toBe(0);
    });

    it("returns 1 for counts 10–19", () => {
      expect(starCountFor(10)).toBe(1);
      expect(starCountFor(15)).toBe(1);
      expect(starCountFor(19)).toBe(1);
    });

    it("returns 2 for counts 20–49", () => {
      expect(starCountFor(20)).toBe(2);
      expect(starCountFor(30)).toBe(2);
      expect(starCountFor(49)).toBe(2);
    });

    it("returns 3 for counts 50 or above", () => {
      expect(starCountFor(50)).toBe(3);
      expect(starCountFor(100)).toBe(3);
      expect(starCountFor(1000)).toBe(3);
    });

    it("handles boundary transitions correctly", () => {
      expect(starCountFor(9)).toBe(0);
      expect(starCountFor(10)).toBe(1);
      expect(starCountFor(19)).toBe(1);
      expect(starCountFor(20)).toBe(2);
      expect(starCountFor(49)).toBe(2);
      expect(starCountFor(50)).toBe(3);
    });
  });

  describe("STAR_THRESHOLDS", () => {
    it("exports correct thresholds for each star count", () => {
      expect(STAR_THRESHOLDS[1]).toBe(10);
      expect(STAR_THRESHOLDS[2]).toBe(20);
      expect(STAR_THRESHOLDS[3]).toBe(50);
    });

    it("thresholds match starCountFor logic", () => {
      // Verify each threshold is the minimum to reach that star count
      expect(starCountFor(STAR_THRESHOLDS[1] - 1)).toBe(0);
      expect(starCountFor(STAR_THRESHOLDS[1])).toBe(1);

      expect(starCountFor(STAR_THRESHOLDS[2] - 1)).toBe(1);
      expect(starCountFor(STAR_THRESHOLDS[2])).toBe(2);

      expect(starCountFor(STAR_THRESHOLDS[3] - 1)).toBe(2);
      expect(starCountFor(STAR_THRESHOLDS[3])).toBe(3);
    });
  });
});
