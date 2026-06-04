"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { UserIcon, ChevronDownIcon } from "@/components/icons";
import { Dropdown, type DropdownItem } from "@/components/common/dropdown";

/** Home-header account menu: avatar trigger -> Profile / Logout via the shared Dropdown. */
export function AccountMenu() {
  const router = useRouter();
  const { t } = useTranslations();

  const items: DropdownItem[] = [
    {
      value: "profile",
      label: t("home.header.profile"),
      trailing: <UserIcon className="size-4" />,
    },
    {
      value: "logout",
      label: t("home.logout"),
      // right-pointing chevron (reuse the down chevron rotated)
      trailing: <ChevronDownIcon className="size-4 -rotate-90" />,
    },
  ];

  const handleSelect = async (value: string) => {
    if (value === "logout") {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
    // "profile": destination page not built yet — wire when it exists.
  };

  return (
    <Dropdown items={items} onSelect={handleSelect} align="end">
      <button
        type="button"
        aria-label={t("home.header.account")}
        className="grid size-10 place-items-center rounded-full text-white/90 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <UserIcon className="size-5" />
      </button>
    </Dropdown>
  );
}
