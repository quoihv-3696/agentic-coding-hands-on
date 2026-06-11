/**
 * Spotlight Board types — shared between all spotlight sub-components.
 * Track B will provide the real data shape in Phase 06; these types enable
 * standalone compilation with mock data today.
 */

export interface PositionedNode {
  recipientProfileId: string;
  displayName: string;
  deptCode: string | null;
  avatarUrl: string | null;
  kudosCount: number;
  latestKudoId: string;
  latestKudoAt: string; // ISO string
  /** Percentage position within the canvas (0–100) */
  x: number;
  y: number;
  /** Font size in px */
  fontSize: number;
  width: number;
  height: number;
  /** Depth cue: 0.5 (far/faint) → 1 (near/bright). */
  opacity: number;
}

export interface RecentEvent {
  kudoId: string;
  recipientDisplayName: string;
  createdAt: string; // ISO string or display string like "08:30PM"
}

export interface SpotlightSearchState {
  query: string;
  setQuery: (q: string) => void;
  /** recipientProfileId of the match → highlight ALL of that person's names. */
  matchId: string | null;
  /** latestKudoId of one matched node → centre + gentle zoom target. */
  focusId: string | null;
}

export interface SpotlightBoardProps {
  positionedNodes: PositionedNode[];
  totalCount: number;
  recentEvents: RecentEvent[];
  state: "loading" | "empty" | "interactive";
  onNodeClick: (latestKudoId: string) => void;
  search: SpotlightSearchState;
}
