"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "@/components/icons";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { searchProfilesAction } from "@/lib/kudos/actions";
import type { Profile } from "@/lib/kudos/types";

interface RecipientComboboxProps {
  value: string; // profile id
  onChange: (profileId: string) => void;
}

export function RecipientCombobox({ value, onChange }: RecipientComboboxProps) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);

  // Debounced server-side search (ilike on name/email).
  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      searchProfilesAction(query).then(setResults);
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-14 flex-1 items-center justify-between rounded-lg border px-6",
            "border-[#998C5F] bg-white text-base font-bold",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F] focus-visible:ring-offset-0",
            selected ? "text-[#00101A]" : "text-[#999]",
          )}
        >
          <span className="truncate leading-6 tracking-[0.15px]">
            {selected ? selected.displayName : t("kudosForm.recipientPlaceholder")}
          </span>
          <ChevronDownIcon className="ml-2 size-6 shrink-0 text-[#00101A]" />
        </button>
      </PopoverTrigger>
      {/* Tailwind v4: use CSS variable shorthand w-(--radix-popover-trigger-width) */}
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("kudosForm.recipientSearchPlaceholder")}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty className="py-3 text-center text-sm font-bold">
              {t("kudosForm.recipientEmpty")}
            </CommandEmpty>
            <CommandGroup>
              {results.map((profile) => (
                <CommandItem
                  key={profile.id}
                  value={profile.id}
                  onSelect={(val) => {
                    const next = val === value ? null : profile;
                    setSelected(next);
                    onChange(next ? next.id : "");
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 font-bold"
                >
                  <span className="text-sm leading-6 tracking-[0.15px]">
                    {profile.displayName}
                  </span>
                  {value === profile.id && <Check className="size-4 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
