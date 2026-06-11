"use client";
"use no memo";

/**
 * SpotlightCanvas — the interactive (pan/zoom) node layer.
 * "use no memo" prevents React Compiler from memoizing the react-zoom-pan-pinch
 * wrappers, which use internal ref-mutation patterns it can't reason about.
 *
 * Transparent fill layer: the SpotlightBoard frame owns the border + the two
 * background image layers behind this. Names are absolutely positioned in a
 * virtual 100×100% space and transform on top of the fixed backdrop.
 */

import { useEffect, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { SpotlightNode } from "./spotlight-node";
import { SpotlightControls } from "./spotlight-controls";
import type { PositionedNode } from "./types";

interface SpotlightCanvasProps {
  nodes: PositionedNode[];
  /** recipientProfileId of the search match → all their name nodes glow red. */
  matchId: string | null;
  /** latestKudoId of one matched node → the element to centre + gently zoom. */
  focusId: string | null;
  onNodeClick: (kudoId: string) => void;
  onExpand: () => void;
}

export function SpotlightCanvas({
  nodes,
  matchId,
  focusId,
  onNodeClick,
  onExpand,
}: SpotlightCanvasProps) {
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);

  // On a search match, gently pan + zoom to centre one of the person's names.
  // Guarded: no-op until the transform API and the target element exist.
  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`spotlight-node-${focusId}`);
    if (el) transformRef.current?.zoomToElement(el, 1.4);
  }, [focusId]);

  return (
    <div className="absolute inset-0">
      {/* Pan/zoom + expand controls — bottom-right overlay */}
      <div className="absolute right-4 bottom-4 z-[60]">
        <SpotlightControls
          onZoomIn={() => transformRef.current?.zoomIn(0.3)}
          onZoomOut={() => transformRef.current?.zoomOut(0.3)}
          onReset={() => transformRef.current?.resetTransform()}
          onExpand={onExpand}
        />
      </div>

      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        panning={{ velocityDisabled: false }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%", cursor: "grab" }}
          contentStyle={{ width: "100%", height: "100%", position: "relative" }}
        >
          {/* Transparent node plane over the frame's fixed backdrop. */}
          <div className="relative h-full w-full">
            {nodes.map((node) => (
              <SpotlightNode
                key={node.latestKudoId}
                node={node}
                isMatch={matchId === node.recipientProfileId}
                onClick={onNodeClick}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
