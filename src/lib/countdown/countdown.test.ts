import { describe, it, expect } from "vitest";
import { formatUnit } from "./format";
import { computeParts } from "./use-countdown";
import { parseEventDateTime } from "./config";

describe("formatUnit", () => {
  describe("valid values within range", () => {
    it("formats single-digit values with leading zero", () => {
      expect(formatUnit(5, 59)).toBe("05");
      expect(formatUnit(0, 59)).toBe("00");
      expect(formatUnit(9, 59)).toBe("09");
    });

    it("formats two-digit values as-is", () => {
      expect(formatUnit(10, 59)).toBe("10");
      expect(formatUnit(23, 23)).toBe("23");
      expect(formatUnit(59, 59)).toBe("59");
      expect(formatUnit(99, 99)).toBe("99");
    });

    it("handles boundary values correctly", () => {
      expect(formatUnit(0, 0)).toBe("00");
      expect(formatUnit(23, 23)).toBe("23"); // Hours max
      expect(formatUnit(59, 59)).toBe("59"); // Minutes max
      expect(formatUnit(99, 99)).toBe("99"); // Days max
    });
  });

  describe("invalid values render as 00", () => {
    it("returns 00 for negative values", () => {
      expect(formatUnit(-1, 59)).toBe("00");
      expect(formatUnit(-5, 99)).toBe("00");
      expect(formatUnit(-100, 99)).toBe("00");
    });

    it("returns 00 for out-of-range values", () => {
      expect(formatUnit(24, 23)).toBe("00"); // Hours > 23
      expect(formatUnit(60, 59)).toBe("00"); // Minutes >= 60
      expect(formatUnit(100, 99)).toBe("00"); // Days > 99
      expect(formatUnit(25, 23)).toBe("00");
    });

    it("returns 00 for non-finite values", () => {
      expect(formatUnit(NaN, 59)).toBe("00");
      expect(formatUnit(Infinity, 59)).toBe("00");
      expect(formatUnit(-Infinity, 59)).toBe("00");
    });

    it("returns 00 for float values out of range", () => {
      expect(formatUnit(59.9, 59)).toBe("00");
      expect(formatUnit(24.1, 23)).toBe("00");
    });
  });

  describe("float values within range are floored", () => {
    it("floors floats that stay within range after truncation", () => {
      expect(formatUnit(5.5, 59)).toBe("05");
      expect(formatUnit(10.9, 59)).toBe("10");
      expect(formatUnit(0.1, 59)).toBe("00");
    });
  });
});

describe("computeParts", () => {
  describe("completion (diff <= 0)", () => {
    it("returns all zeros and isComplete true when diff is exactly zero", () => {
      const target = 1000;
      const now = 1000;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        isComplete: true,
      });
    });

    it("returns all zeros and isComplete true when target is in the past", () => {
      const target = 1000;
      const now = 2000;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        isComplete: true,
      });
    });

    it("returns all zeros and isComplete true when well past target", () => {
      const target = 0;
      const now = 86400000; // Much later
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        isComplete: true,
      });
    });
  });

  describe("active countdown (diff > 0)", () => {
    it("returns isComplete false for future times", () => {
      const target = 100_000;
      const now = 1_000;
      const parts = computeParts(target, now);
      expect(parts.isComplete).toBe(false);
    });

    it("decomposes 1 minute correctly", () => {
      const target = 61_000; // 1 min 1 sec in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 1,
        isComplete: false,
      });
    });

    it("decomposes 1 hour correctly", () => {
      const target = 3_600_000; // Exactly 1 hour in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 1,
        minutes: 0,
        isComplete: false,
      });
    });

    it("decomposes 1 hour 30 minutes correctly", () => {
      const target = 5_400_000; // 1h 30m in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 1,
        minutes: 30,
        isComplete: false,
      });
    });

    it("decomposes 1 day correctly", () => {
      const target = 86_400_000; // Exactly 1 day in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 1,
        hours: 0,
        minutes: 0,
        isComplete: false,
      });
    });

    it("decomposes 1 day 2 hours 30 minutes correctly", () => {
      const target = 95_400_000; // 1d 2h 30m in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 1,
        hours: 2,
        minutes: 30,
        isComplete: false,
      });
    });

    it("decomposes 99 days 23 hours 59 minutes correctly", () => {
      const target = 8_639_940_000; // 99d 23h 59m in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 99,
        hours: 23,
        minutes: 59,
        isComplete: false,
      });
    });

    it("decomposes 5 days 14 hours 17 minutes correctly", () => {
      const target = 483_420_000; // 5d 14h 17m in ms
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 5,
        hours: 14,
        minutes: 17,
        isComplete: false,
      });
    });

    it("handles seconds by flooring (not rounding)", () => {
      const target = 61_999; // 1m 1.999s
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 1,
        isComplete: false,
      });
    });

    it("handles 59 seconds (less than 1 minute)", () => {
      const target = 59_000; // 59 seconds
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        isComplete: false,
      });
    });

    it("computes correctly with non-zero now offset", () => {
      const target = 100_000; // 1m 40s from 0
      const now = 40_000; // Start at 40s, so 60_000ms remaining (1 minute)
      const parts = computeParts(target, now);
      expect(parts).toEqual({
        days: 0,
        hours: 0,
        minutes: 1,
        isComplete: false,
      });
    });

    it("caps days at 99 when more than 99 days remain", () => {
      const days = 150;
      const target = days * 24 * 60 * 60 * 1000; // 150 days from 0
      const parts = computeParts(target, 0);
      expect(parts.days).toBe(99);
      expect(parts.isComplete).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles very large future times (10 years)", () => {
      const target = 315_360_000_000; // ~10 years in ms
      const now = 0;
      const parts = computeParts(target, now);
      // 10 years ≈ 3653 days
      expect(parts.isComplete).toBe(false);
      expect(parts.days).toBeGreaterThan(0);
      expect(parts.hours).toBeGreaterThanOrEqual(0);
      expect(parts.minutes).toBeGreaterThanOrEqual(0);
    });

    it("hours value stays within 0-23", () => {
      const target = 172_800_000; // 2 days exactly
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts.hours).toBe(0);
      expect(parts.hours).toBeLessThan(24);
    });

    it("minutes value stays within 0-59", () => {
      const target = 3_660_000; // 1h 1m
      const now = 0;
      const parts = computeParts(target, now);
      expect(parts.minutes).toBe(1);
      expect(parts.minutes).toBeLessThan(60);
    });
  });
});

describe("parseEventDateTime", () => {
  it("parses a valid ISO-8601 datetime", () => {
    const date = parseEventDateTime("2025-12-31T18:30:00+07:00");
    expect(date).toBeInstanceOf(Date);
    expect(date?.getTime()).toBe(Date.parse("2025-12-31T18:30:00+07:00"));
  });

  it("returns null for missing input", () => {
    expect(parseEventDateTime(undefined)).toBeNull();
    expect(parseEventDateTime("")).toBeNull();
  });

  it("returns null for an invalid datetime string", () => {
    expect(parseEventDateTime("invalid-format")).toBeNull();
    expect(parseEventDateTime("not a date")).toBeNull();
  });
});
