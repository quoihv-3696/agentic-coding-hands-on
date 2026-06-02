"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/i18n-context";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg bg-[#EDE8C8] px-6 py-3 text-sm font-bold tracking-wide text-[#1a1a1a] transition-all duration-200 hover:brightness-105 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {t("home.logout")}
    </button>
  );
}
