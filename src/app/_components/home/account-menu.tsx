"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/i18n-context";
import { UserIcon, ChevronDownIcon, DashboardIcon } from "@/components/icons";
import { Dropdown, type DropdownItem } from "@/components/common/dropdown";

/**
 * Home-header account menu: avatar trigger -> Profile / Admin Dashboard / Logout
 * via the shared Dropdown. The Admin Dashboard item renders only for admins, and
 * is a disabled stub for now — real authorization happens server-side when that
 * route is built (see phase-03). This gate is presentation-only.
 */
export function AccountMenu({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const { t } = useTranslations();

  const items: DropdownItem[] = [
    {
      value: "profile",
      label: t("home.header.profile"),
      trailing: <UserIcon className="size-4" />,
      disabled: true,
    },
    ...(isAdmin
      ? [
          {
            value: "admin",
            label: t("home.header.adminDashboard"),
            trailing: <DashboardIcon className="size-4" />,
            disabled: true,
          } satisfies DropdownItem,
        ]
      : []),
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
    // "profile" / "admin": disabled stubs — wire when their routes exist.
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
