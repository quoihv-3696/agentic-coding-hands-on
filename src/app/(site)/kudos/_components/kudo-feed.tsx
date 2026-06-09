"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import type { KudoFeedRow } from "@/lib/kudos/types";
import { KudoCard } from "./kudo-card";

interface Props {
  rows: KudoFeedRow[];
}

export function KudoFeed({ rows }: Props) {
  const { t } = useTranslations();

  if (rows.length === 0) {
    return (
      <p className="text-center text-secondary-2 py-16">
        {t("kudosFeed.empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-6" role="list">
      {rows.map((row) => (
        <li key={row.id}>
          <KudoCard row={row} />
        </li>
      ))}
    </ul>
  );
}
