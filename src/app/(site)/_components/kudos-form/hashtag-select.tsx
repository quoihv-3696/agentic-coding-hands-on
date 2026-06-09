"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { KUDO_HASHTAGS } from "@/lib/kudos/hashtags";

// Checkmark icon (inline — no asset needed)
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

interface HashtagSelectProps {
  value: string[]; // selected slugs
  onChange: (slugs: string[]) => void;
  /** Max selectable hashtags — design shows 5 */
  max?: number;
}

export function HashtagSelect({ value, onChange, max = 5 }: HashtagSelectProps) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  function toggle(slug: string) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
    } else if (value.length < max) {
      onChange([...value, slug]);
    }
  }

  // Selected pills shown beside the trigger button
  const selectedHashtags = KUDO_HASHTAGS.filter((h) => value.includes(h.slug));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Selected tag pills — each with a trailing ✕ to deselect */}
      {selectedHashtags.map((h) => (
        <span
          key={h.slug}
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#998C5F] bg-white px-3 text-sm font-bold leading-6 tracking-[0.15px] text-[#00101A]"
        >
          {h.label}
          <button
            type="button"
            aria-label={`${t("kudosForm.hashtagRemove")}: ${h.label}`}
            onClick={() => toggle(h.slug)}
            className="shrink-0 rounded-full p-0.5 text-[#00101A] hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
          >
            <X className="size-4" aria-hidden />
          </button>
        </span>
      ))}

      {/* Trigger: open dropdown to add/change */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("kudosForm.hashtagsPlaceholder")}
            className={cn(
              "inline-flex h-12 items-center gap-2 rounded-lg border px-3 text-left",
              "border-[#998C5F] bg-white text-[#00101A]",
              "hover:bg-[#FFF8E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]",
            )}
          >
            <Plus className="size-5 shrink-0 text-[#998C5F]" aria-hidden />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold">{t("kudosForm.hashtagsLabel")}</span>
              <span className="text-xs font-bold text-[#998C5F]">
                {t("kudosForm.hashtagsMax")}
              </span>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[318px] border border-[#998C5F] bg-[#00070C] p-1.5"
          align="start"
        >
          <ul role="listbox" aria-multiselectable="true" aria-label={t("kudosForm.hashtagsLabel")}>
            {KUDO_HASHTAGS.map((h) => {
              const isSelected = value.includes(h.slug);
              const isDisabled = !isSelected && value.length >= max;
              return (
                <li
                  key={h.slug}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                >
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggle(h.slug)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-4 py-2.5 text-left text-sm font-bold leading-6 tracking-[0.15px] text-white",
                      isSelected && "bg-[rgba(255,234,158,0.2)]",
                      !isSelected && !isDisabled && "hover:bg-[rgba(255,234,158,0.1)]",
                      isDisabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span>{h.label}</span>
                    {isSelected && (
                      <CheckIcon className="size-4 shrink-0 text-[#FFEA9E]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
