"use client";

/**
 * SpotlightNode — one recipient label in the word-cloud canvas.
 * Absolutely positioned; font-size scales with kudosCount.
 * Keyboard-focusable for a11y; tooltip shown on hover/focus.
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SpotlightTooltip } from "./spotlight-tooltip";
import type { PositionedNode } from "./types";

interface SpotlightNodeProps {
  node: PositionedNode;
  isMatch: boolean;
  onClick: (kudoId: string) => void;
}

export function SpotlightNode({ node, isMatch, onClick }: SpotlightNodeProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      id={`spotlight-node-${node.latestKudoId}`}
      aria-label={`${node.displayName} — ${node.kudosCount} kudos`}
      className={cn(
        "absolute cursor-pointer select-none font-bold font-[Montserrat] tracking-wide",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
        isMatch
          ? "text-error-2 drop-shadow-[0_0_8px_rgba(241,118,118,0.8)]"
          : "text-white hover:text-primary",
        hovered && "text-primary",
      )}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        fontSize: `${node.fontSize}px`,
        // Depth: bigger/closer labels are brighter and sit above smaller ones.
        // A matched or hovered node always pops to full opacity + top.
        opacity: isMatch || hovered ? 1 : node.opacity,
        zIndex: isMatch || hovered ? 50 : Math.round(node.fontSize),
        transform: "translate(-50%, -50%)",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
      onClick={() => onClick(node.latestKudoId)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {node.displayName}
      {(hovered) && (
        <SpotlightTooltip
          displayName={node.displayName}
          time={node.latestKudoAt}
        />
      )}
    </button>
  );
}
