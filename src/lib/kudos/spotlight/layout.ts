/**
 * Non-overlapping scattered word-cloud layout for the Spotlight Board.
 *
 * Pure module — no React, no DOM, no Supabase. Fully unit-testable.
 *
 * Design goals:
 *  1. NO OVERLAP: each label is placed where its AABB doesn't intersect any
 *     already-placed label — so names stay individually clickable.
 *  2. SCATTERED: each label starts from a per-id seeded random anchor, then walks
 *     a golden-angle spiral outward only as far as needed to clear collisions —
 *     organic, not a rigid grid.
 *  3. APPEND-ONLY STABILITY: nodes are placed oldest → newest, so a newly-arrived
 *     kudo is positioned LAST against the existing set and never moves the others.
 *  4. DETERMINISTIC: same input set → identical output (seeded by id, stable sort).
 *  5. DEPTH: smaller fonts read fainter (opacity) and sit lower in z-order.
 *
 * Fonts are intentionally small; the canvas is pan/zoom, so users zoom in to read.
 */
import type { SpotlightNode } from "./types";

export interface PositionedNode extends SpotlightNode {
  x: number; // label centre, in the virtual canvas pixel space (dims)
  y: number;
  fontSize: number;
  width: number;
  height: number;
  /** Depth cue: 0.5 (far/faint) → 1 (near/bright), monotonic with kudosCount. */
  opacity: number;
}

// ─── Font-size mapping (small — zoom to read) ─────────────────────────────────

const FONT_MIN = 6;
const FONT_MAX = 11;

export function fontSizeFor(kudosCount: number, maxCount: number): number {
  if (maxCount <= 0) return FONT_MIN;
  const ratio = Math.sqrt(
    Math.min(1, Math.max(0, kudosCount) / Math.max(1, maxCount)),
  );
  return Math.round(FONT_MIN + ratio * (FONT_MAX - FONT_MIN));
}

// ─── Label box estimate ───────────────────────────────────────────────────────

const CHAR_WIDTH_FACTOR = 0.55;
const LINE_HEIGHT_FACTOR = 1.3;
/** Gap added around every label so neighbours don't touch (eases clicking). */
const GAP = 6;

function labelBox(label: string, fontSize: number): { w: number; h: number } {
  return {
    w: label.length * fontSize * CHAR_WIDTH_FACTOR + GAP,
    h: fontSize * LINE_HEIGHT_FACTOR + GAP,
  };
}

interface AABB {
  x: number; // centre
  y: number;
  w: number;
  h: number;
}

function overlaps(a: AABB, b: AABB): boolean {
  return (
    Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
    Math.abs(a.y - b.y) < (a.h + b.h) / 2
  );
}

// ─── Deterministic per-id PRNG ─────────────────────────────────────────────────

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

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const SPIRAL_STEP = 7; // px growth per spiral index
const MAX_TRIES = 900; // collision-search budget per node before giving up

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Lay out `nodes` within `dims` with NO overlaps. Coordinates are label centres
 * in the virtual pixel space; the caller maps them to canvas percentages.
 */
export function layoutNodes(
  nodes: SpotlightNode[],
  dims: { width: number; height: number },
): PositionedNode[] {
  if (nodes.length === 0) return [];

  // Oldest first (append-only stability), stable tiebreak by id.
  const sorted = [...nodes].sort((a, b) => {
    if (a.latestKudoAt !== b.latestKudoAt) {
      return a.latestKudoAt < b.latestKudoAt ? -1 : 1;
    }
    return a.latestKudoId.localeCompare(b.latestKudoId);
  });

  const maxCount = sorted.reduce((m, n) => Math.max(m, n.kudosCount), 0);
  const placed: AABB[] = [];
  const result: PositionedNode[] = [];

  for (const node of sorted) {
    const fontSize = fontSizeFor(node.kudosCount, maxCount);
    const { w, h } = labelBox(node.displayName, fontSize);

    // Per-id seeded anchor, kept inside bounds so the whole label stays visible.
    const rng = mulberry32(hashSeed(node.latestKudoId));
    const minX = w / 2;
    const minY = h / 2;
    const spanX = Math.max(0, dims.width - w);
    const spanY = Math.max(0, dims.height - h);
    const anchorX = minX + rng() * spanX;
    const anchorY = minY + rng() * spanY;

    // Spiral outward from the anchor until the box clears every placed box.
    let cx = anchorX;
    let cy = anchorY;
    for (let k = 0; k < MAX_TRIES; k++) {
      const r = SPIRAL_STEP * Math.sqrt(k);
      const theta = k * GOLDEN_ANGLE;
      cx = Math.min(
        dims.width - w / 2,
        Math.max(w / 2, anchorX + r * Math.cos(theta)),
      );
      cy = Math.min(
        dims.height - h / 2,
        Math.max(h / 2, anchorY + r * Math.sin(theta)),
      );
      const box: AABB = { x: cx, y: cy, w, h };
      if (!placed.some((p) => overlaps(box, p))) break;
    }

    placed.push({ x: cx, y: cy, w, h });
    const sizeRatio = (fontSize - FONT_MIN) / (FONT_MAX - FONT_MIN || 1);
    result.push({
      ...node,
      x: cx,
      y: cy,
      fontSize,
      width: w,
      height: h,
      opacity: Math.min(1, Math.max(0.5, 0.55 + sizeRatio * 0.45)),
    });
  }

  return result;
}
