import { describe, it, expect } from "vitest";
import { createKudoSchema } from "./schema";

describe("createKudoSchema", () => {
  const validPayload = {
    recipientProfileId: "550e8400-e29b-41d4-a716-446655440000",
    title: "Great work on the feature",
    bodyHtml: "<p>You did an amazing job implementing this feature!</p>",
    hashtags: ["high-performing", "be-professional"],
    imageUrls: [],
    mentionProfileIds: [],
    isAnonymous: false,
  };

  describe("valid payloads", () => {
    it("accepts a fully-valid kudo", () => {
      const result = createKudoSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("accepts 1-5 hashtags", () => {
      expect(
        createKudoSchema.safeParse({
          ...validPayload,
          hashtags: ["high-performing"],
        }).success
      ).toBe(true);

      expect(
        createKudoSchema.safeParse({
          ...validPayload,
          hashtags: ["high-performing", "be-professional", "be-optimistic", "be-a-team", "think-outside-the-box"],
        }).success
      ).toBe(true);
    });

    it("accepts 0-5 image URLs", () => {
      expect(
        createKudoSchema.safeParse({
          ...validPayload,
          imageUrls: [],
        }).success
      ).toBe(true);

      expect(
        createKudoSchema.safeParse({
          ...validPayload,
          imageUrls: [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg",
            "https://example.com/img3.jpg",
            "https://example.com/img4.jpg",
            "https://example.com/img5.jpg",
          ],
        }).success
      ).toBe(true);
    });

    it("accepts anonymous kudo with nickname", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        isAnonymous: true,
        anonymousNickname: "Secret Admirer",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty mentionProfileIds array", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        mentionProfileIds: [],
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid mention profile IDs", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        mentionProfileIds: [
          "550e8400-e29b-41d4-a716-446655440001",
          "550e8400-e29b-41d4-a716-446655440002",
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid payloads — recipient", () => {
    it("rejects missing recipientProfileId", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        recipientProfileId: undefined,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty recipientProfileId", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        recipientProfileId: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects non-UUID recipientProfileId", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        recipientProfileId: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("invalid payloads — title", () => {
    it("rejects missing title", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        title: undefined,
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty title", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        title: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("invalid payloads — body HTML", () => {
    it("rejects body whose plain text exceeds 1000 characters", () => {
      const longText = "A".repeat(1001);
      const result = createKudoSchema.safeParse({
        ...validPayload,
        bodyHtml: `<p>${longText}</p>`,
      });
      expect(result.success).toBe(false);
    });

    it("accepts body with exactly 1000 characters of plain text", () => {
      const text1000 = "A".repeat(1000);
      const result = createKudoSchema.safeParse({
        ...validPayload,
        bodyHtml: `<p>${text1000}</p>`,
      });
      expect(result.success).toBe(true);
    });

    it("strips HTML tags when counting length", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        bodyHtml: "<p><strong>Hi</strong></p><p>This is 50 chars of " + "A".repeat(25) + "</p>",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid payloads — hashtags", () => {
    it("rejects 0 hashtags", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        hashtags: [],
      });
      expect(result.success).toBe(false);
    });

    it("rejects 6 hashtags", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        hashtags: [
          "high-performing",
          "be-professional",
          "be-optimistic",
          "be-a-team",
          "think-outside-the-box",
          "get-risky",
        ],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("invalid payloads — images", () => {
    it("rejects 6 image URLs", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        imageUrls: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
          "https://example.com/4.jpg",
          "https://example.com/5.jpg",
          "https://example.com/6.jpg",
        ],
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid URL in imageUrls", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        imageUrls: ["not-a-valid-url"],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("invalid payloads — anonymous", () => {
    it("rejects isAnonymous=true without anonymousNickname", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        isAnonymous: true,
        anonymousNickname: undefined,
      });
      expect(result.success).toBe(false);
    });

    it("rejects isAnonymous=true with empty anonymousNickname", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        isAnonymous: true,
        anonymousNickname: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects isAnonymous=true with whitespace-only anonymousNickname", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        isAnonymous: true,
        anonymousNickname: "   ",
      });
      expect(result.success).toBe(false);
    });

    it("accepts isAnonymous=false without anonymousNickname", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        isAnonymous: false,
        anonymousNickname: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("invalid payloads — mention profile IDs", () => {
    it("rejects non-UUID mention profile IDs", () => {
      const result = createKudoSchema.safeParse({
        ...validPayload,
        mentionProfileIds: ["not-a-uuid"],
      });
      expect(result.success).toBe(false);
    });
  });
});
