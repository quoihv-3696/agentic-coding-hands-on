import { z } from "zod";
import { KUDO_HASHTAGS } from "./hashtags";

const HASHTAG_SLUGS = KUDO_HASHTAGS.map((h) => h.slug);

/**
 * Validation schema for the createKudo input.
 *
 * Lives in its own module (NOT the `"use server"` actions file) so it can be a
 * plain, synchronous export — imported by both the server action and unit tests
 * without violating the "server functions must be async" contract.
 */
export const createKudoSchema = z
  .object({
    recipientProfileId: z.string().uuid("recipientProfileId must be a UUID"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or fewer"),
    bodyHtml: z.string().refine(
      (html) => {
        // Count plain text (strip tags): must be non-empty and ≤ 1000 chars.
        const text = html.replace(/<[^>]*>/g, "").trim();
        return text.length >= 1 && text.length <= 1000;
      },
      { message: "Body must be between 1 and 1000 characters" },
    ),
    hashtags: z
      .array(z.string())
      .min(1, "At least 1 hashtag is required")
      .max(5, "No more than 5 hashtags allowed")
      .refine((tags) => tags.every((t) => HASHTAG_SLUGS.includes(t)), {
        message: "Unknown hashtag",
      }),
    imageUrls: z.array(z.string().url()).max(5, "No more than 5 images allowed"),
    mentionProfileIds: z.array(z.string().uuid()),
    isAnonymous: z.boolean(),
    anonymousNickname: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isAnonymous && !data.anonymousNickname?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anonymousNickname"],
        message: "anonymousNickname is required when isAnonymous is true",
      });
    }
  });

export type CreateKudoSchema = typeof createKudoSchema;
