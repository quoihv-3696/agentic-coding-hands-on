"use client";

import { Button } from "@/components/button";
import { PenIcon, SearchIcon } from "@/components/icons";

interface KudosInputPillProps {
  /** i18n placeholder — kudosBoard.input.placeholder (write/send pill). */
  placeholder: string;
  /** i18n label — kudosBoard.searchSunner (profile search). */
  searchLabel: string;
  /** Click on the write pill → opens the write/send form dialog. */
  onOpen?: () => void;
  /** Click on the search button → opens Sunner profile search (Plan 3). */
  onSearch?: () => void;
}

/**
 * Kudos Live Board — Hero action row (spec A.1 + profile search).
 *
 * TWO secondary buttons (pill-shaped, 72px tall, rounded-full): the wide write
 * pill (pen icon + placeholder, left-aligned) and the profile search
 * (search icon + label). Both are buttons, not inputs.
 */
export function KudosInputPill({
  placeholder,
  searchLabel,
  onOpen,
  onSearch,
}: KudosInputPillProps) {
  return (
    <div className="flex w-full items-center gap-6">
      {/* Write pill — wide, left-aligned */}
      <Button
        variant="secondary"
        onClick={onOpen}
        aria-label={placeholder}
        leftIcon={<PenIcon className="size-6 shrink-0 text-primary-1" />}
        className="h-18 flex-1 justify-start gap-4 rounded-full px-6 font-normal text-secondary-2"
      >
        <span className="truncate">{placeholder}</span>
      </Button>

      {/* Profile search — auto width */}
      <Button
        variant="secondary"
        onClick={onSearch}
        leftIcon={<SearchIcon className="size-6 shrink-0 text-primary-1" />}
        className="h-18 shrink-0 gap-2 rounded-full px-8 font-normal"
      >
        {searchLabel}
      </Button>
    </div>
  );
}
