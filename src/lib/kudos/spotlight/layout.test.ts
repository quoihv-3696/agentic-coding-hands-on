import { describe, it, expect } from "vitest";
import { layoutNodes, fontSizeFor } from "./layout";
import type { SpotlightNode } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** latestKudoAt is set from `id` so the oldest→newest sort is deterministic. */
function makeNode(
  id: string,
  kudosCount: number,
  displayName = `User${id}`,
): SpotlightNode {
  return {
    recipientProfileId: id,
    displayName,
    deptCode: null,
    avatarUrl: null,
    kudosCount,
    latestKudoId: `kudo-${id}`,
    latestKudoAt: id,
  };
}

const DIMS = { width: 1400, height: 800 };
const FONT_MIN = 6;
const FONT_MAX = 11;

function aabbOverlap(a: SpotlightNode & { x: number; y: number; width: number; height: number }, b: typeof a) {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2
  );
}

// ─── fontSizeFor ──────────────────────────────────────────────────────────────

describe("fontSizeFor", () => {
  it("returns FONT_MIN for 0 count", () => {
    expect(fontSizeFor(0, 100)).toBe(FONT_MIN);
  });
  it("returns FONT_MAX for count equal to maxCount", () => {
    expect(fontSizeFor(50, 50)).toBe(FONT_MAX);
  });
  it("is monotonic: higher count => equal or larger font", () => {
    const max = 100;
    let prev = fontSizeFor(0, max);
    for (let c = 1; c <= max; c++) {
      const cur = fontSizeFor(c, max);
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });
  it("clamps within [FONT_MIN, FONT_MAX] for count > maxCount", () => {
    const size = fontSizeFor(200, 50);
    expect(size).toBeGreaterThanOrEqual(FONT_MIN);
    expect(size).toBeLessThanOrEqual(FONT_MAX);
  });
  it("returns FONT_MIN when maxCount is 0", () => {
    expect(fontSizeFor(0, 0)).toBe(FONT_MIN);
  });
});

// ─── No overlap ───────────────────────────────────────────────────────────────

describe("layoutNodes — no overlap", () => {
  it("places 30 nodes with no overlapping label boxes", () => {
    const nodes = Array.from({ length: 30 }, (_, i) =>
      makeNode(String(i).padStart(3, "0"), (i % 8) + 1),
    );
    const r = layoutNodes(nodes, DIMS);
    for (let i = 0; i < r.length; i++) {
      for (let j = i + 1; j < r.length; j++) {
        expect(
          aabbOverlap(r[i], r[j]),
          `${r[i].recipientProfileId} overlaps ${r[j].recipientProfileId}`,
        ).toBe(false);
      }
    }
  });

  it("keeps every node within the canvas bounds", () => {
    const nodes = Array.from({ length: 40 }, (_, i) => makeNode(String(i), (i % 8) + 1));
    for (const n of layoutNodes(nodes, DIMS)) {
      expect(n.x - n.width / 2).toBeGreaterThanOrEqual(-0.01);
      expect(n.x + n.width / 2).toBeLessThanOrEqual(DIMS.width + 0.01);
      expect(n.y - n.height / 2).toBeGreaterThanOrEqual(-0.01);
      expect(n.y + n.height / 2).toBeLessThanOrEqual(DIMS.height + 0.01);
    }
  });
});

// ─── Depth opacity ────────────────────────────────────────────────────────────

describe("layoutNodes — depth opacity", () => {
  it("opacity within [0.5, 1]", () => {
    const r = layoutNodes([makeNode("a", 1), makeNode("b", 10), makeNode("c", 50)], DIMS);
    for (const n of r) {
      expect(n.opacity).toBeGreaterThanOrEqual(0.5);
      expect(n.opacity).toBeLessThanOrEqual(1);
    }
  });
});

// ─── Determinism ──────────────────────────────────────────────────────────────

describe("layoutNodes — determinism", () => {
  it("identical output on two calls with the same input", () => {
    const nodes = Array.from({ length: 30 }, (_, i) =>
      makeNode(String(i).padStart(4, "0"), (i % 10) + 1),
    );
    const a = layoutNodes(nodes, DIMS);
    const b = layoutNodes(nodes, DIMS);
    for (let i = 0; i < a.length; i++) {
      expect(a[i].x).toBe(b[i].x);
      expect(a[i].y).toBe(b[i].y);
      expect(a[i].fontSize).toBe(b[i].fontSize);
      expect(a[i].opacity).toBe(b[i].opacity);
    }
  });

  it("result is independent of input array order", () => {
    const nodes = Array.from({ length: 15 }, (_, i) =>
      makeNode(String(i).padStart(4, "0"), i + 1),
    );
    const shuffled = [...nodes].sort(() => 0.5 - Math.random());
    const byId = (arr: ReturnType<typeof layoutNodes>) =>
      [...arr].sort((x, y) => x.recipientProfileId.localeCompare(y.recipientProfileId));
    const a = byId(layoutNodes(nodes, DIMS));
    const b = byId(layoutNodes(shuffled, DIMS));
    for (let i = 0; i < a.length; i++) {
      expect(a[i].x).toBe(b[i].x);
      expect(a[i].y).toBe(b[i].y);
    }
  });
});

// ─── Append-only stability ────────────────────────────────────────────────────

describe("layoutNodes — append-only stability", () => {
  it("a newer node leaves all existing nodes' positions unchanged", () => {
    const original = [
      makeNode("a-old", 20, "Alice"),
      makeNode("b-old", 15, "Bob"),
      makeNode("c-old", 10, "Carol"),
    ];
    // 'z-new' sorts last (newest by latestKudoAt) → placed last, must not move others.
    const withExtra = [...original, makeNode("z-new", 5, "Zoe")];
    const before = layoutNodes(original, DIMS);
    const after = layoutNodes(withExtra, DIMS);
    for (const orig of before) {
      const m = after.find((n) => n.recipientProfileId === orig.recipientProfileId);
      expect(m).toBeDefined();
      expect(m!.x).toBe(orig.x);
      expect(m!.y).toBe(orig.y);
    }
  });
});

// ─── Font monotonic ───────────────────────────────────────────────────────────

describe("layoutNodes — font size monotonicity", () => {
  it("higher kudosCount => equal or larger fontSize", () => {
    const r = layoutNodes(
      [makeNode("a", 1), makeNode("b", 5), makeNode("c", 10), makeNode("d", 20), makeNode("e", 50)],
      DIMS,
    );
    const byCount = new Map(r.map((n) => [n.kudosCount, n.fontSize]));
    const counts = [1, 5, 10, 20, 50];
    for (let i = 0; i < counts.length - 1; i++) {
      expect(byCount.get(counts[i + 1])!).toBeGreaterThanOrEqual(byCount.get(counts[i])!);
    }
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("layoutNodes — edge cases", () => {
  it("returns empty array for 0 nodes", () => {
    expect(layoutNodes([], DIMS)).toEqual([]);
  });

  it("handles ~400 nodes without throwing and stays numeric/in-range", () => {
    const nodes = Array.from({ length: 400 }, (_, i) =>
      makeNode(String(i).padStart(6, "0"), (i % 25) + 1, `P${i}`),
    );
    let r: ReturnType<typeof layoutNodes>;
    expect(() => {
      r = layoutNodes(nodes, DIMS);
    }).not.toThrow();
    r = layoutNodes(nodes, DIMS);
    expect(r.length).toBe(400);
    for (const n of r) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
      expect(n.fontSize).toBeGreaterThanOrEqual(FONT_MIN);
      expect(n.fontSize).toBeLessThanOrEqual(FONT_MAX);
      expect(n.opacity).toBeGreaterThanOrEqual(0.5);
      expect(n.opacity).toBeLessThanOrEqual(1);
    }
  });
});
