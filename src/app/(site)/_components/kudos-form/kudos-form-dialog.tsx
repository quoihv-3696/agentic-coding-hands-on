"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import type { CreateKudoInput } from "@/lib/kudos/types";
import { createKudo } from "@/lib/kudos/actions";
import { uploadKudoImages } from "@/lib/kudos/storage";
import { RecipientCombobox } from "./recipient-combobox";
import { BodyEditor } from "./body-editor";
import { HashtagSelect } from "./hashtag-select";
import { ImageUploader, type ImageFile } from "./image-uploader";

interface KudosFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  recipientProfileId: string;
  title: string;
  bodyHtml: string;
  hashtags: string[];
  images: ImageFile[];
  mentionProfileIds: string[];
  isAnonymous: boolean;
  anonymousNickname: string;
}

const INITIAL_STATE: FormState = {
  recipientProfileId: "",
  title: "",
  bodyHtml: "",
  hashtags: [],
  images: [],
  mentionProfileIds: [],
  isAnonymous: false,
  anonymousNickname: "",
};

export function KudosFormDialog({ open, onOpenChange }: KudosFormDialogProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.recipientProfileId)
      next.recipientProfileId = t("kudosForm.validation.recipientRequired");
    if (!form.title.trim())
      next.title = t("kudosForm.validation.titleRequired");
    if (!form.bodyHtml || form.bodyHtml === "<p></p>")
      next.bodyHtml = t("kudosForm.validation.bodyRequired");
    if (form.hashtags.length === 0)
      next.hashtags = t("kudosForm.validation.hashtagsRequired");
    if (form.images.length > 5)
      next.images = t("kudosForm.validation.imagesTooMany");
    if (form.isAnonymous && !form.anonymousNickname.trim())
      next.anonymousNickname = t("kudosForm.validation.nicknameRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Upload images client-side first → real Storage public URLs.
      const imageUrls = form.images.length
        ? await uploadKudoImages(form.images.map((img) => img.file))
        : [];

      const input: CreateKudoInput = {
        recipientProfileId: form.recipientProfileId,
        title: form.title,
        bodyHtml: form.bodyHtml,
        hashtags: form.hashtags,
        imageUrls,
        mentionProfileIds: form.mentionProfileIds,
        isAnonymous: form.isAnonymous,
        anonymousNickname: form.isAnonymous ? form.anonymousNickname : null,
      };

      // 2. Persist via the server action (validates, sanitizes, inserts).
      const result = await createKudo(input);
      if ("error" in result) {
        setSubmitError(result.error || t("kudosForm.errorGeneric"));
        setSubmitting(false);
        return;
      }

      // 3. Success → close and show the new Kudo on the feed.
      handleClose();
      router.push("/kudos");
      router.refresh();
    } catch {
      setSubmitError(t("kudosForm.errorGeneric"));
      setSubmitting(false);
    }
  }

  function handleClose() {
    // Revoke any local object URLs to avoid memory leaks
    form.images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setForm(INITIAL_STATE);
    setErrors({});
    setSubmitting(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // sm:max-w-[752px] overrides shadcn DialogContent's base `sm:max-w-sm`
          // (384px) — without the matching sm: variant, tailwind-merge keeps both
          // and the narrower one wins, capping the dialog at 384px.
          "w-[min(752px,calc(100vw-2rem))] sm:max-w-188 rounded-3xl border-none bg-[#FFF8E1] p-10 shadow-2xl",
          "max-h-[96vh] overflow-y-auto",
        )}
        aria-describedby={undefined}
      >
        {/* Heading — Figma: "Gửi lời cám ơn và ghi nhận đến đồng đội", 32px bold centered */}
        <DialogTitle className="mb-8 text-center text-[32px] font-bold leading-10 text-[#00101A]">
          {t("kudosForm.heading")}
        </DialogTitle>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-8"
        >
          {/* ── A: Người nhận (Recipient) ── */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <FieldLabel text={t("kudosForm.recipientLabel")} required />
              <RecipientCombobox
                value={form.recipientProfileId}
                onChange={(id) => patch("recipientProfileId", id)}
              />
            </div>
            {errors.recipientProfileId && (
              <FieldError message={errors.recipientProfileId} />
            )}
          </div>

          {/* ── B: Danh hiệu / Title ── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <FieldLabel text={t("kudosForm.titleLabel")} required />
              <Input
                value={form.title}
                onChange={(e) => patch("title", e.target.value)}
                placeholder={t("kudosForm.titlePlaceholder")}
                className={cn(
                  "h-14 flex-1 rounded-lg border border-[#998C5F] bg-white px-6",
                  "font-bold text-[#00101A] placeholder:font-bold placeholder:text-[#999]",
                  "focus-visible:ring-[#998C5F]",
                  errors.title && "border-red-500",
                )}
              />
            </div>
            {/* Hint from Figma design */}
            <p className="text-sm font-bold leading-6 tracking-[0.15px] text-[#999]">
              Ví dụ: Người truyền động lực cho tôi. Danh hiệu sẽ hiển thị làm
              tiêu đề Kudos của bạn.
            </p>
            {errors.title && <FieldError message={errors.title} />}
          </div>

          {/* ── C+D: Nội dung (TipTap body editor) ── */}
          <div className="flex flex-col gap-1">
            <BodyEditor
              onChange={(html) => patch("bodyHtml", html)}
              onMentionsChange={(ids) => patch("mentionProfileIds", ids)}
            />
            {/* @ hint from Figma */}
            <p className="text-sm font-bold leading-6 tracking-[0.5px] text-[#00101A]">
              Bạn có thể &ldquo;@ + tên&rdquo; để nhắc tới đồng nghiệp khác
            </p>
            {errors.bodyHtml && <FieldError message={errors.bodyHtml} />}
          </div>

          {/* ── E: Hashtag ── */}
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-4">
              <FieldLabel
                text={t("kudosForm.hashtagsLabel")}
                required
                className="pt-2.5"
              />
              <HashtagSelect
                value={form.hashtags}
                onChange={(slugs) => patch("hashtags", slugs)}
              />
            </div>
            {errors.hashtags && <FieldError message={errors.hashtags} />}
          </div>

          {/* ── F: Image ── */}
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-4">
              <FieldLabel text="Image" className="pt-3" />
              <ImageUploader
                images={form.images}
                onChange={(imgs) => patch("images", imgs)}
              />
            </div>
            {errors.images && <FieldError message={errors.images} />}
          </div>

          {/* ── G: Gửi ẩn danh (Anonymous toggle + nickname) ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Checkbox
                id="kudo-anonymous"
                checked={form.isAnonymous}
                onCheckedChange={(checked) =>
                  patch("isAnonymous", checked === true)
                }
                className="size-6 rounded border border-[#998C5F] bg-white data-[state=checked]:bg-[#998C5F] data-[state=checked]:text-white"
              />
              <label
                htmlFor="kudo-anonymous"
                className="cursor-pointer text-[22px] font-bold leading-7 text-[#999]"
              >
                {t("kudosForm.anonymousLabel")}
              </label>
            </div>

            {/* Nickname field — revealed when anonymous checked */}
            {form.isAnonymous && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4">
                  <FieldLabel text={t("kudosForm.nicknameLabel")} required />
                  <Input
                    value={form.anonymousNickname}
                    onChange={(e) => patch("anonymousNickname", e.target.value)}
                    placeholder={t("kudosForm.nicknamePlaceholder")}
                    className={cn(
                      "h-14 flex-1 rounded-lg border border-[#998C5F] bg-white px-6",
                      "font-bold text-[#00101A] placeholder:font-bold placeholder:text-[#999]",
                      "focus-visible:ring-[#998C5F]",
                      errors.anonymousNickname && "border-red-500",
                    )}
                  />
                </div>
                {errors.anonymousNickname && (
                  <FieldError message={errors.anonymousNickname} />
                )}
              </div>
            )}
          </div>

          {/* Submit error banner */}
          {submitError && (
            <p role="alert" className="text-sm font-bold text-[#CF1322]">
              {submitError}
            </p>
          )}

          {/* ── H: Actions — Cancel + Send ── */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className={cn(
                "flex h-15 items-center justify-center gap-2 rounded px-10",
                "border border-[#998C5F] bg-[rgba(255,234,158,0.1)]",
                "text-base font-bold leading-6 text-[#00101A]",
                "hover:bg-[rgba(255,234,158,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {t("kudosForm.cancel")}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "flex h-15 flex-1 items-center justify-center gap-2 rounded-lg",
                "bg-[#FFEA9E] text-[22px] font-bold leading-7 text-[#00101A]",
                "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {submitting ? t("kudosForm.sending") : t("kudosForm.send")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function FieldLabel({
  text,
  required,
  className,
}: {
  text: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex w-40 shrink-0 items-center gap-0.5 text-[22px] font-bold leading-7 text-[#00101A]",
        className,
      )}
    >
      {text}
      {required && (
        <span className="ml-0.5 font-bold text-[#CF1322]" aria-hidden>
          *
        </span>
      )}
    </span>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm font-bold text-[#CF1322]">
      {message}
    </p>
  );
}
