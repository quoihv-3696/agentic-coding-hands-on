"use client";

import { useRef } from "react";
import Image from "next/image";
import { X, ImagePlus } from "lucide-react";
import { useTranslations } from "@/lib/i18n/i18n-context";

export interface ImageFile {
  id: string;
  /** Local object URL created via URL.createObjectURL — MOCK, replaced in Phase 06 */
  previewUrl: string;
  file: File;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  max?: number;
}

export function ImageUploader({ images, onChange, max = 5 }: ImageUploaderProps) {
  const { t } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = max - images.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newImages: ImageFile[] = toAdd.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      previewUrl: URL.createObjectURL(file),
      file,
    }));
    onChange([...images, ...newImages]);
  }

  function handleRemove(id: string) {
    const removed = images.find((img) => img.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(images.filter((img) => img.id !== id));
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Image previews */}
      {images.map((img) => (
        <div
          key={img.id}
          className="relative size-20 shrink-0 rounded-[18px] border border-[#998C5F] bg-white"
        >
          <Image
            src={img.previewUrl}
            alt=""
            fill
            className="rounded border border-[#FFEA9E] object-cover"
            sizes="80px"
          />
          <button
            type="button"
            aria-label={t("kudosForm.imageRemove")}
            onClick={() => handleRemove(img.id)}
            className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#D4271D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4271D]"
          >
            <X className="size-3 text-white" aria-hidden />
          </button>
        </div>
      ))}

      {/* Add image button — shown when under max */}
      {images.length < max && (
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            aria-label={t("kudosForm.imagesHint")}
            onClick={() => inputRef.current?.click()}
            className="flex h-12 items-center gap-2 rounded-lg border border-[#998C5F] bg-white px-2 text-sm font-bold text-[#00101A] hover:bg-[#FFF8E1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]"
          >
            <ImagePlus className="size-5 text-[#998C5F]" aria-hidden />
            <span className="text-xs leading-6 tracking-[0.15px]">
              {t("kudosForm.imagesHint")}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            aria-hidden
          />
        </div>
      )}
    </div>
  );
}
