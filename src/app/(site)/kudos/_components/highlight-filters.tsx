"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { KudoHashtag } from "@/lib/kudos/hashtags";
import type { HighlightFilters } from "@/lib/kudos/types";
import { useTranslations } from "@/lib/i18n/i18n-context";

interface FilterButtonProps {
  label: string;
  active: boolean;
}

function FilterButton({ label, active }: FilterButtonProps) {
  return (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className={cn(
          // From design: border 1px #998C5F, bg rgba(255,234,158,0.10), padding 16px, border-radius 4px
          "flex items-center gap-2 px-4 py-4 rounded border text-sm font-bold leading-6 transition-colors",
          "border-border-detail",
          active
            ? "bg-primary-1/20 text-primary-1"
            : "bg-primary-1/10 text-secondary-1 hover:bg-primary-1/20 hover:text-primary-1",
        )}
        aria-label={label}
      >
        <span>{label}</span>
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>
    </DropdownMenuTrigger>
  );
}

interface HighlightFiltersProps {
  hashtags: readonly KudoHashtag[];
  departments: readonly string[];
  filters: HighlightFilters;
  onFilterChange: (filters: HighlightFilters) => void;
}

export function HighlightFilters({
  hashtags,
  departments,
  filters,
  onFilterChange,
}: HighlightFiltersProps) {
  const { t } = useTranslations();

  const activeHashtagLabel = hashtags.find((h) => h.slug === filters.hashtag)?.label;
  const hashtagLabel = activeHashtagLabel ?? t("kudosBoard.highlight.filterHashtag");
  const deptLabel = filters.department ?? t("kudosBoard.highlight.filterDept");

  function selectHashtag(slug: string) {
    onFilterChange({
      ...filters,
      hashtag: filters.hashtag === slug ? undefined : slug,
    });
  }

  function selectDepartment(dept: string) {
    onFilterChange({
      ...filters,
      department: filters.department === dept ? undefined : dept,
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* Hashtag filter */}
      <DropdownMenu>
        <FilterButton label={hashtagLabel} active={!!filters.hashtag} />
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {hashtags.map((h) => (
            <DropdownMenuItem
              key={h.slug}
              onClick={() => selectHashtag(h.slug)}
              className={cn(
                "font-bold text-sm",
                filters.hashtag === h.slug && "text-primary-1",
              )}
            >
              {h.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Phòng ban filter */}
      <DropdownMenu>
        <FilterButton label={deptLabel} active={!!filters.department} />
        <DropdownMenuContent align="end" className="min-w-[140px]">
          {departments.map((dept) => (
            <DropdownMenuItem
              key={dept}
              onClick={() => selectDepartment(dept)}
              className={cn(
                "font-bold text-sm",
                filters.department === dept && "text-primary-1",
              )}
            >
              {dept}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
