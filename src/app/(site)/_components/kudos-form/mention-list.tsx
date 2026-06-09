"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/kudos/types";

interface MentionListProps {
  items: Profile[];
  command: (attrs: { id: string; label: string }) => void;
  emptyLabel: string;
}

/** Imperative handle the TipTap suggestion plugin drives via `component.ref`. */
export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * @mention suggestion dropdown. Exposes `onKeyDown` via ref so the TipTap
 * suggestion plugin can drive keyboard navigation (↑/↓/Enter) — without the
 * forwardRef + imperative handle, `component.ref` is null and the editor's
 * onKeyDown bridge throws.
 */
export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  function MentionList({ items, command, emptyLabel }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Reset highlight to the top whenever the result set changes.
    useEffect(() => setSelectedIndex(0), [items]);

    function selectItem(index: number) {
      const item = items[index];
      if (item) command({ id: item.id, label: item.displayName });
    }

    // Explicit deps: under React Compiler (reactCompiler: true) the handle factory
    // can be memoized, which would freeze `selectedIndex`/`items` in the closure
    // and make Enter pick the wrong item. The dep array forces a fresh handle.
    useImperativeHandle(
      ref,
      () => ({
        onKeyDown: ({ event }) => {
          if (items.length === 0) return false;
          if (event.key === "ArrowUp") {
            setSelectedIndex((i) => (i + items.length - 1) % items.length);
            return true;
          }
          if (event.key === "ArrowDown") {
            setSelectedIndex((i) => (i + 1) % items.length);
            return true;
          }
          if (event.key === "Enter") {
            const item = items[selectedIndex];
            if (item) command({ id: item.id, label: item.displayName });
            return true;
          }
          return false;
        },
      }),
      [items, selectedIndex, command],
    );

    return (
      <ul className="pointer-events-auto w-56 rounded-lg border border-[#998C5F] bg-[#00070C] py-1.5 shadow-lg">
        {items.length === 0 ? (
          <li className="px-4 py-2 text-sm font-bold text-[#999]">{emptyLabel}</li>
        ) : (
          items.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={cn(
                  "w-full px-4 py-2 text-left text-sm font-bold leading-6 text-white hover:bg-[rgba(255,234,158,0.15)]",
                  i === selectedIndex && "bg-[rgba(255,234,158,0.15)]",
                )}
                onClick={() => selectItem(i)}
              >
                {p.displayName}
              </button>
            </li>
          ))
        )}
      </ul>
    );
  },
);
