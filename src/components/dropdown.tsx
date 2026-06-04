"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type DropdownItem = {
  value: string;
  label: React.ReactNode;
  /** Leading visual (flag / icon). */
  icon?: React.ReactNode;
  /** Trailing visual (chevron, count, …). */
  trailing?: React.ReactNode;
  disabled?: boolean;
};

type DropdownProps = {
  items: DropdownItem[];
  /** Currently selected value — its row gets the primary/20 highlight. */
  value?: string;
  onSelect?: (value: string) => void;
  /** Trigger element (rendered via Radix `asChild`). */
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  /** Extra classes for the content panel (e.g. width). */
  className?: string;
};

export function Dropdown({
  items,
  value,
  onSelect,
  children,
  align = "start",
  sideOffset = 8,
  className,
}: DropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // SAA design shell over the shadcn defaults
          "flex w-auto min-w-32 flex-col gap-1 rounded-md border border-border-detail bg-container-2 p-1.5 ring-0",
          className,
        )}
      >
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <DropdownMenuItem
              key={item.value}
              disabled={item.disabled}
              onSelect={() => onSelect?.(item.value)}
              data-selected={selected || undefined}
              // radius 4px via style: the named scale has no 4px token (sm=6/md=8/lg=10)
              // and the editor's class canonicalizer rewrites rounded-[4px] incorrectly.
              style={{ borderRadius: 4 }}
              className={cn(
                // Text/body/large: Montserrat 400, 16px, line-height 24px, +0.5px tracking; item padding 16px
                "cursor-pointer gap-2.5 p-4 text-base font-normal leading-6 tracking-[0.5px] text-secondary-1",
                "focus:bg-primary/10 focus:text-secondary-1",
                selected && "bg-primary/20",
              )}
            >
              {/* icon + label glow on the selected row (gold glow + soft drop shadow per design) */}
              <span
                className={cn(
                  "flex flex-1 items-center gap-2.5",
                  selected && "gold-glow",
                )}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
              </span>
              {item.trailing}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
