"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  /** Up to 5 image URLs (Figma: 88×88 thumbnails in a row). */
  imageUrls: string[];
  /** Alt prefix used for screen reader labels (e.g. the kudo title). */
  altPrefix: string;
}

export function KudoGallery({ imageUrls, altPrefix }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  if (imageUrls.length === 0) return null;

  // Figma: up to 5 thumbnails, gap-4 (16px), each 88×88, border-radius 18px, border 1px #998C5F
  const displayed = imageUrls.slice(0, 5);

  function handleOpen(idx: number) {
    setSelected(idx);
    setOpen(true);
  }

  return (
    <>
      {/* Thumbnail row — C.3.6 Image đính kèm */}
      <div className="flex flex-row items-center gap-4">
        {displayed.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => handleOpen(i)}
            aria-label={`${altPrefix} image ${i + 1}`}
            className="relative shrink-0 size-[88px] overflow-hidden rounded-[18px] border border-[#998C5F] bg-white hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFEA9E]"
          >
            <Image
              src={url}
              alt={`${altPrefix} ${i + 1}`}
              fill
              sizes="88px"
              className="object-cover rounded-[4px]"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Lightbox dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-[#00070C] border border-[#998C5F]/40 p-4 flex flex-col gap-4">
          <DialogTitle className="sr-only">
            {altPrefix} — image {selected + 1} of {displayed.length}
          </DialogTitle>

          {/* Main image */}
          <div className="relative w-full aspect-square max-h-[70vh]">
            <Image
              src={displayed[selected]}
              alt={`${altPrefix} ${selected + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Thumbnail nav — only show when >1 image */}
          {displayed.length > 1 && (
            <div className="flex flex-row justify-center gap-3">
              {displayed.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-label={`${altPrefix} image ${i + 1}`}
                  aria-pressed={i === selected}
                  className={`relative size-14 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === selected
                      ? "border-[#FFEA9E]"
                      : "border-[#998C5F]/40 hover:border-[#998C5F]"
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    aria-hidden
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
