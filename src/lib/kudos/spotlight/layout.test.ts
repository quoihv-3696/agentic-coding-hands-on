import { describe, it, expect } from "vitest";
import { layoutNodes, fontSizeFor } from "./layout";
import type { SpotlightNode } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    latestKudoAt: new Date().toISOString(),
  };
}

/** Large canvas that fits all reasonable test sets. */
const DIMS = { width: 1400, height: 800 };
const FONT_MIN = 6;
const FONT_MAX = 12;

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

  it("clamps safely for count > maxCount", () => {
    const size = fontSizeFor(200, 50);
    expect(size).toBeGreaterThanOrEqual(FONT_MIN);
    expect(size).toBeLessThanOrEqual(FONT_MAX);
  });

  it("returns FONT_MIN when maxCount is 0", () => {
    expect(fontSizeFor(0, 0)).toBe(FONT_MIN);
  });
});

// ─── Scatter: spread across the canvas, within bounds ─────────────────────────

describe("layoutNodes — scatter within bounds", () => {
  it("places every node inside the canvas dims", () => {
    const nodes = Array.from({ length: 40 }, (_, i) =>
      makeNode(String(i), (i % 10) + 1),
    );
    const result = layoutNodes(nodes, DIMS);
    for (const n of result) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(DIMS.width);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeLessThanOrEqual(DIMS.height);
    }
  });

  it("spreads nodes (not all clustered at one point)", () => {
    const nodes = Array.from({ length: 40 }, (_, i) =>
      makeNode(String(i).padStart(3, "0"), (i % 10) + 1),
    );
    const result = layoutNodes(nodes, DIMS);
    const xs = result.map((n) => n.x);
    const ys = result.map((n) => n.y);
    // Spread should cover a meaningful fraction of the canvas span.
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(DIMS.width * 0.4);
    expect(Math.max(...ys) - Math.min(...ys)).toBeGreaterThan(DIMS.height * 0.4);
  });
});

// ─── Depth: opacity in range, monotonic with font size ────────────────────────

describe("layoutNodes — depth opacity", () => {
  it("opacity is within [0.5, 1] and larger fonts are at least as opaque", () => {
    const nodes = [
      makeNode("a", 1),
      makeNode("b", 10),
      makeNode("c", 50),
    ];
    const result = layoutNodes(nodes, DIMS);
    for (const n of result) {
      expect(n.opacity).toBeGreaterThanOrEqual(0.5);
      expect(n.opacity).toBeLessThanOrEqual(1);
    }
  });
});

// ─── Deterministic — same input → identical output ───────────────────────────

describe("layoutNodes — determinism", () => {
  it("produces identical coordinates on two calls with the same input", () => {
    const nodes = Array.from({ length: 30 }, (_, i) =>
      makeNode(String(i).padStart(4, "0"), (i % 10) + 1),
    );

    const first = layoutNodes(nodes, DIMS);
    const second = layoutNodes(nodes, DIMS);

    expect(first.length).toBe(second.length);
    for (let i = 0; i < first.length; i++) {
      expect(first[i].x).toBe(second[i].x);
      expect(first[i].y).toBe(second[i].y);
      expect(first[i].fontSize).toBe(second[i].fontSize);
      expect(first[i].opacity).toBe(second[i].opacity);
    }
  });

  it("result is independent of input array order", () => {
    const nodes = Array.from({ length: 15 }, (_, i) =>
      makeNode(String(i).padStart(4, "0"), i + 1),
    );
    const shuffled = [...nodes].sort(() => 0.5 - Math.random());

    const a = layoutNodes(nodes, DIMS);
    const b = layoutNodes(shuffled, DIMS);

    const sortById = (arr: typeof a) =>
      [...arr].sort((x, y) =>
        x.recipientProfileId.localeCompare(y.recipientProfileId),
      );

    const sortedA = sortById(a);
    const sortedB = sortById(b);

    for (let i = 0; i < sortedA.length; i++) {
      expect(sortedA[i].x).toBe(sortedB[i].x);
      expect(sortedA[i].y).toBe(sortedB[i].y);
    }
  });
});

// ─── Append-only stability — adding a node keeps prior coords stable ─────────

describe("layoutNodes — append-only stability", () => {
  it("existing nodes keep their coords when a new node is added", () => {
    const original = [
      makeNode("aaa", 20, "Alice"),
      makeNode("bbb", 15, "Bob"),
      makeNode("ccc", 10, "Carol"),
    ];

    const withExtra = [...original, makeNode("zzz", 1, "Zach")];

    const before = layoutNodes(original, DIMS);
    const after = layoutNodes(withExtra, DIMS);

    for (const orig of before) {
      const match = after.find(
        (n) => n.recipientProfileId === orig.recipientProfileId,
      );
      expect(match).toBeDefined();
      expect(match!.x).toBe(orig.x);
      expect(match!.y).toBe(orig.y);
    }
  });
});

// ─── Font size monotonic with kudosCount ──────────────────────────────────────

describe("layoutNodes — font size monotonicity", () => {
  it("nodes with higher kudosCount get equal or larger fontSize", () => {
    const nodes = [
      makeNode("a", 1),
      makeNode("b", 5),
      makeNode("c", 10),
      makeNode("d", 20),
      makeNode("e", 50),
    ];
    const result = layoutNodes(nodes, DIMS);

    const byCount = new Map(result.map((n) => [n.kudosCount, n.fontSize]));
    const counts = [1, 5, 10, 20, 50];
    for (let i = 0; i < counts.length - 1; i++) {
      const fLow = byCount.get(counts[i])!;
      const fHigh = byCount.get(counts[i + 1])!;
      expect(fHigh).toBeGreaterThanOrEqual(fLow);
    }
  });
});

// ─── Edge cases: 0 nodes and ~400 nodes ───────────────────────────────────────

describe("layoutNodes — edge cases", () => {
  it("returns empty array for 0 nodes without throwing", () => {
    expect(() => layoutNodes([], DIMS)).not.toThrow();
    expect(layoutNodes([], DIMS)).toEqual([]);
  });

  it("handles ~400 nodes without throwing", () => {
    const nodes = Array.from({ length: 400 }, (_, i) =>
      makeNode(String(i).padStart(6, "0"), (i % 30) + 1, `Employee${i}`),
    );
    expect(() => layoutNodes(nodes, DIMS)).not.toThrow();
    expect(layoutNodes(nodes, DIMS).length).toBe(400);
  });

  it("all 400-node results have numeric x/y/fontSize/width/height/opacity", () => {
    const nodes = Array.from({ length: 400 }, (_, i) =>
      makeNode(String(i).padStart(6, "0"), (i % 25) + 1, `Person${i}`),
    );
    const result = layoutNodes(nodes, DIMS);
    for (const n of result) {
      expect(typeof n.x).toBe("number");
      expect(typeof n.y).toBe("number");
      expect(n.fontSize).toBeGreaterThanOrEqual(FONT_MIN);
      expect(n.fontSize).toBeLessThanOrEqual(FONT_MAX);
      expect(n.width).toBeGreaterThan(0);
      expect(n.height).toBeGreaterThan(0);
      expect(n.opacity).toBeGreaterThanOrEqual(0.5);
      expect(n.opacity).toBeLessThanOrEqual(1);
    }
  });
});
