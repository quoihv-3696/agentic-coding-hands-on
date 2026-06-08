import { type StaticImageData } from "next/image";
import { AWARD_CATEGORIES } from "@/lib/awards/categories";
import { AWARD_DETAILS } from "@/lib/awards/award-details";
import { AwardCard } from "./award-card";
import topTalent from "@/assets/images/home/awards/top-talent.png";
import topProject from "@/assets/images/home/awards/top-project.png";
import topProjectLeader from "@/assets/images/home/awards/top-project-leader.png";
import bestManager from "@/assets/images/home/awards/best-manager.png";
import signature2025Creator from "@/assets/images/home/awards/signature-2025-creator.png";
import mvp from "@/assets/images/home/awards/mvp.png";

/** Trophy graphic keyed by category slug — mirrors awards-section.tsx map. */
const AWARD_IMAGES: Record<string, StaticImageData> = {
  "top-talent": topTalent,
  "top-project": topProject,
  "top-project-leader": topProjectLeader,
  "best-manager": bestManager,
  "signature-2025-creator": signature2025Creator,
  mvp,
};

/** Renders all 6 award cards stacked vertically, 80px gap. */
export function AwardList() {
  const len = AWARD_CATEGORIES.length;

  return (
    <div className="flex flex-col gap-20">
      {AWARD_CATEGORIES.map((c, i) => (
        <AwardCard
          key={c.slug}
          slug={c.slug}
          image={AWARD_IMAGES[c.slug]}
          titleKey={c.titleKey}
          detail={AWARD_DETAILS[c.slug]}
          imageSide={i % 2 === 0 ? "left" : "right"}
          showDivider={i < len - 1}
        />
      ))}
    </div>
  );
}
