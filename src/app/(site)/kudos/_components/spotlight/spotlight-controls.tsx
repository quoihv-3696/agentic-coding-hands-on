"use client";

/**
 * SpotlightControls — zoom-in / zoom-out / reset buttons.
 * Matches design node 3007:17479 (B.7.2_Pan zoom).
 * Positioned at bottom-right of the canvas overlay.
 */

import { useTranslations } from "@/lib/i18n/i18n-context";

interface SpotlightControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExpand: () => void;
}

export function SpotlightControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onExpand,
}: SpotlightControlsProps) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#998C5F] bg-[rgba(0,16,26,0.7)] p-1">
      <ControlButton
        onClick={onZoomIn}
        aria-label={t("kudosSpotlight.zoomIn")}
        title={t("kudosSpotlight.zoomIn")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </ControlButton>

      <ControlButton
        onClick={onZoomOut}
        aria-label={t("kudosSpotlight.zoomOut")}
        title={t("kudosSpotlight.zoomOut")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </ControlButton>

      <ControlButton
        onClick={onReset}
        aria-label={t("kudosSpotlight.reset")}
        title={t("kudosSpotlight.reset")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
        </svg>
      </ControlButton>

      <ControlButton
        onClick={onExpand}
        aria-label={t("kudosSpotlight.expand")}
        title={t("kudosSpotlight.expand")}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      </ControlButton>
    </div>
  );
}

function ControlButton({
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      {...rest}
    >
      {children}
    </button>
  );
}
