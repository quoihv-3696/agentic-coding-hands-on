/**
 * Scattered "3D" word-cloud layout for the Spotlight Board.
 *
 * Pure module — no React, no DOM, no Supabase. Fully unit-testable.
 *
 * Design goals:
 *  1. DETERMINISTIC: same input → identical output (each node is seeded by its
 *     own recipientProfileId, never by array order or neighbours).
 *  2. APPEND-ONLY STABILITY: adding a new node never moves existing nodes — a
 *     node's position depends solely on its own id.
 *  3. SCATTERED ("loạn xạ"): nodes spread across the WHOLE canvas (not clustered
 *     at the centre); slight overlap is allowed for a dense constellation feel.
 *  4. 3D DEPTH: font size scales with kudosCount; opacity + z-order scale with it
 *     too, so bigger contributors read as "closer" and small ones recede.
 *  5. Handles 0 nodes and ~400 nodes without throwing.
 *
 * Placement is a per-id seeded pseudo-random point within an inset of the canvas
 * (the inset leaves room for the top overlays — count/search — and the bottom
 * ticker). react-zoom-pan-pinch transforms this scene on top; layout is zoom-agnostic.
 */
import type { SpotlightNode } from "./types";

export interface PositionedNode extends SpotlightNode {
  /** Label centre, in the virtual canvas pixel space passed as `dims`. */
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
  /** Depth cue: 0.5 (far/faint) → 1 (near/bright), monotonic with kudosCount. */
  opacity: number;
}

// ─── Font-size mapping ────────────────────────────────────────────────────────

const FONT_MIN = 6;
const FONT_MAX = 12;

/**
 * Map kudosCount to a font size in [FONT_MIN, FONT_MAX] via a sqrt scale so
 * moderate contributors stay visible and outliers don't dominate the canvas.
 */
export function fontSizeFor(kudosCount: number, maxCount: number): number {
  if (maxCount <= 0) return FONT_MIN;
  const ratio = Math.sqrt(
    Math.min(1, Math.max(0, kudosCount) / Math.max(1, maxCount)),
  );
  return Math.round(FONT_MIN + ratio * (FONT_MAX - FONT_MIN));
}

// ─── AABB estimate (width/height for the rendered label) ───────────────────────

const CHAR_WIDTH_FACTOR = 0.55;
const LINE_HEIGHT_FACTOR = 1.3;

function labelWidth(label: string, fontSize: number): number {
  return label.length * fontSize * CHAR_WIDTH_FACTOR;
}

// ─── Deterministic per-id PRNG ─────────────────────────────────────────────────

/** xmur3 string hash → 32-bit seed. */
function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG → returns successive floats in [0,1). */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Inset fractions: leave headroom for the top overlays + bottom ticker.
const INSET_X = 0.05;
const INSET_TOP = 0.14;
const INSET_BOTTOM = 0.12;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Scatter `nodes` across `dims`, returning a `PositionedNode[]` with centre (x,y),
 * fontSize, width/height estimate, and a depth `opacity`. Positions are seeded by
 * recipientProfileId so the layout is deterministic and append-stable.
 */
export function layoutNodes(
  nodes: SpotlightNode[],
  dims: { width: number; height: number },
): PositionedNode[] {
  if (nodes.length === 0) return [];

  const maxCount = nodes.reduce((m, n) => Math.max(m, n.kudosCount), 0);

  const minX = dims.width * INSET_X;
  const spanX = dims.width * (1 - INSET_X * 2);
  const minY = dims.height * INSET_TOP;
  const spanY = dims.height * (1 - INSET_TOP - INSET_BOTTOM);

  return nodes.map((node) => {
    // Seed by the unique per-kudo id (not recipientProfileId) so a recipient's
    // multiple kudos scatter to distinct positions instead of stacking.
    const rng = mulberry32(hashSeed(node.latestKudoId));
    const fontSize = fontSizeFor(node.kudosCount, maxCount);
    const width = labelWidth(node.displayName, fontSize);
    const height = fontSize * LINE_HEIGHT_FACTOR;

    // Two draws → x, y; a third adds a touch of opacity jitter so equal-size
    // labels still vary in depth.
    const x = minX + rng() * spanX;
    const y = minY + rng() * spanY;
    const sizeRatio = (fontSize - FONT_MIN) / (FONT_MAX - FONT_MIN || 1);
    const opacity = Math.min(
      1,
      Math.max(0.5, 0.55 + sizeRatio * 0.4 + rng() * 0.1),
    );

    return { ...node, x, y, fontSize, width, height, opacity };
  });
}
