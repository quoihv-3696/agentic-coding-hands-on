import { describe, it, expect } from "vitest";
import { heroTierFor, HERO_TIER_LABEL_KEY } from "./tiers";

describe("heroTierFor", () => {
  describe("boundary testing for tier transitions", () => {
    it("returns 'new' for 0 kudos received", () => {
      expect(heroTierFor(0)).toBe("new");
    });

    it("returns 'new' for 1-4 kudos (inclusive boundaries)", () => {
      expect(heroTierFor(1)).toBe("new");
      expect(heroTierFor(2)).toBe("new");
      expect(heroTierFor(3)).toBe("new");
      expect(heroTierFor(4)).toBe("new");
    });

    it("transitions from 'new' to 'rising' at 5", () => {
      expect(heroTierFor(4)).toBe("new");
      expect(heroTierFor(5)).toBe("rising");
    });

    it("returns 'rising' for 5-9 kudos (inclusive boundaries)", () => {
      expect(heroTierFor(5)).toBe("rising");
      expect(heroTierFor(7)).toBe("rising");
      expect(heroTierFor(9)).toBe("rising");
    });

    it("transitions from 'rising' to 'super' at 10", () => {
      expect(heroTierFor(9)).toBe("rising");
      expect(heroTierFor(10)).toBe("super");
    });

    it("returns 'super' for 10-20 kudos (inclusive boundaries)", () => {
      expect(heroTierFor(10)).toBe("super");
      expect(heroTierFor(15)).toBe("super");
      expect(heroTierFor(20)).toBe("super");
    });

    it("transitions from 'super' to 'legend' at 21", () => {
      expect(heroTierFor(20)).toBe("super");
      expect(heroTierFor(21)).toBe("legend");
    });

    it("returns 'legend' for 21+ kudos", () => {
      expect(heroTierFor(21)).toBe("legend");
      expect(heroTierFor(50)).toBe("legend");
      expect(heroTierFor(100)).toBe("legend");
      expect(heroTierFor(999)).toBe("legend");
    });
  });
});

describe("HERO_TIER_LABEL_KEY", () => {
  it("contains all 4 tiers", () => {
    expect(Object.keys(HERO_TIER_LABEL_KEY)).toContain("new");
    expect(Object.keys(HERO_TIER_LABEL_KEY)).toContain("rising");
    expect(Object.keys(HERO_TIER_LABEL_KEY)).toContain("super");
    expect(Object.keys(HERO_TIER_LABEL_KEY)).toContain("legend");
    expect(Object.keys(HERO_TIER_LABEL_KEY)).toHaveLength(4);
  });

  it("maps each tier to a non-empty i18n key", () => {
    expect(HERO_TIER_LABEL_KEY.new).toBeTruthy();
    expect(HERO_TIER_LABEL_KEY.rising).toBeTruthy();
    expect(HERO_TIER_LABEL_KEY.super).toBeTruthy();
    expect(HERO_TIER_LABEL_KEY.legend).toBeTruthy();
  });

  it("uses correct i18n key pattern (kudosFeed.tiers.*)", () => {
    expect(HERO_TIER_LABEL_KEY.new).toMatch(/^kudosFeed\.tiers\./);
    expect(HERO_TIER_LABEL_KEY.rising).toMatch(/^kudosFeed\.tiers\./);
    expect(HERO_TIER_LABEL_KEY.super).toMatch(/^kudosFeed\.tiers\./);
    expect(HERO_TIER_LABEL_KEY.legend).toMatch(/^kudosFeed\.tiers\./);
  });
});
