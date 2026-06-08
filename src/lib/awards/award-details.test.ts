import { describe, it, expect } from "vitest";
import { AWARD_CATEGORIES } from "./categories";
import { AWARD_DETAILS } from "./award-details";
import messagesVi from "@/lib/i18n/messages/vi.json";
import messagesEn from "@/lib/i18n/messages/en.json";

/** Resolve a dotted i18n key to a value in the messages object. */
function resolveDottedKey(
  obj: Record<string, unknown>,
  key: string
): string | null {
  const parts = key.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (typeof current !== "object" || current === null || !(part in current)) {
      return null; // Key not found
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : null;
}

describe("AWARD_DETAILS data integrity", () => {
  describe("slug coverage and uniqueness", () => {
    it("has entries for every slug in AWARD_CATEGORIES", () => {
      const detailsSlugs = new Set(Object.keys(AWARD_DETAILS));
      const categorySlugs = new Set(AWARD_CATEGORIES.map((cat) => cat.slug));

      expect(detailsSlugs).toEqual(categorySlugs);
    });

    it("contains no extra/orphan slugs not in AWARD_CATEGORIES", () => {
      const categorySlugs = new Set(AWARD_CATEGORIES.map((cat) => cat.slug));
      const detailsSlugs = Object.keys(AWARD_DETAILS);

      for (const slug of detailsSlugs) {
        expect(categorySlugs.has(slug)).toBe(true);
      }
    });
  });

  describe("prize count by award type", () => {
    it("signature-2025-creator has exactly 2 prizes", () => {
      const detail = AWARD_DETAILS["signature-2025-creator"];
      expect(detail.prizes.length).toBe(2);
    });

    it("all other awards have exactly 1 prize", () => {
      const otherSlugs = AWARD_CATEGORIES.map((cat) => cat.slug).filter(
        (slug) => slug !== "signature-2025-creator"
      );

      for (const slug of otherSlugs) {
        const detail = AWARD_DETAILS[slug];
        expect(detail.prizes.length).toBe(1);
      }
    });
  });

  describe("quantity values", () => {
    it("top-talent has quantity 10", () => {
      expect(AWARD_DETAILS["top-talent"].quantity).toBe("10");
    });

    it("top-project has quantity 02", () => {
      expect(AWARD_DETAILS["top-project"].quantity).toBe("02");
    });

    it("top-project-leader has quantity 03", () => {
      expect(AWARD_DETAILS["top-project-leader"].quantity).toBe("03");
    });

    it("best-manager has quantity 01", () => {
      expect(AWARD_DETAILS["best-manager"].quantity).toBe("01");
    });

    it("signature-2025-creator has quantity 01", () => {
      expect(AWARD_DETAILS["signature-2025-creator"].quantity).toBe("01");
    });

    it("mvp has quantity 01", () => {
      expect(AWARD_DETAILS.mvp.quantity).toBe("01");
    });
  });

  describe("i18n key resolution - Vietnamese", () => {
    it("resolves all quantityUnitKey values in vi.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        const value = resolveDottedKey(messagesVi, detail.quantityUnitKey);
        expect(value).not.toBeNull();
        expect(value).not.toBe("");
      }
    });

    it("resolves all longDescKey values in vi.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        const value = resolveDottedKey(messagesVi, detail.longDescKey);
        expect(value).not.toBeNull();
        expect(value).not.toBe("");
      }
    });

    it("resolves all prize valueKey values in vi.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        for (let i = 0; i < detail.prizes.length; i++) {
          const prize = detail.prizes[i];
          const value = resolveDottedKey(messagesVi, prize.valueKey);
          expect(value).not.toBeNull();
          expect(value).not.toBe("");
        }
      }
    });

    it("resolves all prize noteKey values in vi.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        for (let i = 0; i < detail.prizes.length; i++) {
          const prize = detail.prizes[i];
          const value = resolveDottedKey(messagesVi, prize.noteKey);
          expect(value).not.toBeNull();
          expect(value).not.toBe("");
        }
      }
    });

    it("resolves page-level keys in vi.json", () => {
      const pageKeys = [
        "awardsPage.heading",
        "awardsPage.subheading",
        "awardsPage.quantityLabel",
        "awardsPage.prizeLabel",
        "awardsPage.or",
      ];

      for (const key of pageKeys) {
        const value = resolveDottedKey(messagesVi, key);
        expect(value).not.toBeNull();
        expect(value).not.toBe("");
      }
    });
  });

  describe("i18n key resolution - English", () => {
    it("resolves all quantityUnitKey values in en.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        const value = resolveDottedKey(messagesEn, detail.quantityUnitKey);
        expect(value).not.toBeNull();
        expect(value).not.toBe("");
      }
    });

    it("resolves all longDescKey values in en.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        const value = resolveDottedKey(messagesEn, detail.longDescKey);
        expect(value).not.toBeNull();
        expect(value).not.toBe("");
      }
    });

    it("resolves all prize valueKey values in en.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        for (let i = 0; i < detail.prizes.length; i++) {
          const prize = detail.prizes[i];
          const value = resolveDottedKey(messagesEn, prize.valueKey);
          expect(value).not.toBeNull();
          expect(value).not.toBe("");
        }
      }
    });

    it("resolves all prize noteKey values in en.json", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        for (let i = 0; i < detail.prizes.length; i++) {
          const prize = detail.prizes[i];
          const value = resolveDottedKey(messagesEn, prize.noteKey);
          expect(value).not.toBeNull();
          expect(value).not.toBe("");
        }
      }
    });

    it("resolves page-level keys in en.json", () => {
      const pageKeys = [
        "awardsPage.heading",
        "awardsPage.subheading",
        "awardsPage.quantityLabel",
        "awardsPage.prizeLabel",
        "awardsPage.or",
      ];

      for (const key of pageKeys) {
        const value = resolveDottedKey(messagesEn, key);
        expect(value).not.toBeNull();
        expect(value).not.toBe("");
      }
    });
  });

  describe("structural validation", () => {
    it("every AWARD_DETAIL has all required fields", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        expect(detail.quantity).toBeDefined();
        expect(detail.quantityUnitKey).toBeDefined();
        expect(detail.longDescKey).toBeDefined();
        expect(detail.prizes).toBeDefined();
        expect(Array.isArray(detail.prizes)).toBe(true);
        expect(detail.prizes.length).toBeGreaterThan(0);
      }
    });

    it("every prize has both valueKey and noteKey", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        for (let i = 0; i < detail.prizes.length; i++) {
          const prize = detail.prizes[i];
          expect(prize.valueKey).toBeDefined();
          expect(prize.noteKey).toBeDefined();
          expect(typeof prize.valueKey).toBe("string");
          expect(typeof prize.noteKey).toBe("string");
        }
      }
    });

    it("quantity is always a string to preserve leading zeros", () => {
      for (const detail of Object.values(AWARD_DETAILS)) {
        expect(typeof detail.quantity).toBe("string");
      }
    });
  });
});
