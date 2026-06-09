import { describe, it, expect } from "vitest";
import { KUDO_HASHTAGS, hashtagLabel } from "./hashtags";

describe("KUDO_HASHTAGS", () => {
  it("has exactly 8 hashtags", () => {
    expect(KUDO_HASHTAGS).toHaveLength(8);
  });

  it("all entries have non-empty slug and label", () => {
    KUDO_HASHTAGS.forEach((tag) => {
      expect(tag.slug).toBeTruthy();
      expect(tag.label).toBeTruthy();
      expect(tag.slug).toMatch(/^[a-z\-]+$/); // kebab-case slugs
      expect(tag.label).toMatch(/^#/); // labels start with #
    });
  });

  it("all slugs are unique", () => {
    const slugs = KUDO_HASHTAGS.map((tag) => tag.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("contains expected canonical hashtags", () => {
    const slugs = KUDO_HASHTAGS.map((tag) => tag.slug);
    expect(slugs).toContain("high-performing");
    expect(slugs).toContain("be-professional");
    expect(slugs).toContain("be-optimistic");
    expect(slugs).toContain("be-a-team");
    expect(slugs).toContain("think-outside-the-box");
    expect(slugs).toContain("get-risky");
    expect(slugs).toContain("go-fast");
    expect(slugs).toContain("wasshoi");
  });
});

describe("hashtagLabel", () => {
  it("returns the correct label for each slug", () => {
    KUDO_HASHTAGS.forEach((tag) => {
      expect(hashtagLabel(tag.slug)).toBe(tag.label);
    });
  });

  it("returns the input slug when hashtag is not found", () => {
    expect(hashtagLabel("unknown")).toBe("unknown");
    expect(hashtagLabel("nonexistent-tag")).toBe("nonexistent-tag");
  });

  it("handles empty string gracefully", () => {
    expect(hashtagLabel("")).toBe("");
  });
});
