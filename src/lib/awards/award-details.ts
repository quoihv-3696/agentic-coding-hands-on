/**
 * Per-award detail data for the Awards Information page (`/awards`).
 *
 * Lives apart from {@link AWARD_CATEGORIES} (slug/title/short-desc) so the
 * homepage cards stay lean — only the detail page needs quantity/prize/long
 * description. Keyed by the same canonical slug; title still comes from
 * AWARD_CATEGORIES. Values are authoritative from the MoMorph design
 * (screen zFYDgyj_pD); copy lives in i18n (vi/en).
 */
export interface AwardPrize {
  /** i18n key for the amount, e.g. "7.000.000 VNĐ". */
  valueKey: string;
  /** i18n key for the note under the amount, e.g. "cho mỗi giải thưởng". */
  noteKey: string;
}

export interface AwardDetail {
  /** Quantity shown large; string to preserve the leading zero ("02", "01"). */
  quantity: string;
  /** i18n key for the unit label, e.g. "Cá nhân" / "Tập thể". */
  quantityUnitKey: string;
  /** i18n key for the long description paragraph. */
  longDescKey: string;
  /** One prize normally; Signature 2025 - Creator has two. */
  prizes: AwardPrize[];
}

/** Keyed by {@link AWARD_CATEGORIES} slug. */
export const AWARD_DETAILS: Record<string, AwardDetail> = {
  "top-talent": {
    quantity: "10",
    quantityUnitKey: "awardsPage.units.individual",
    longDescKey: "awardsPage.desc.topTalent",
    prizes: [{ valueKey: "awardsPage.prizes.topTalent.value", noteKey: "awardsPage.prizes.perAward" }],
  },
  "top-project": {
    quantity: "02",
    quantityUnitKey: "awardsPage.units.team",
    longDescKey: "awardsPage.desc.topProject",
    prizes: [{ valueKey: "awardsPage.prizes.topProject.value", noteKey: "awardsPage.prizes.perAward" }],
  },
  "top-project-leader": {
    quantity: "03",
    quantityUnitKey: "awardsPage.units.individual",
    longDescKey: "awardsPage.desc.topProjectLeader",
    prizes: [{ valueKey: "awardsPage.prizes.topProjectLeader.value", noteKey: "awardsPage.prizes.perAward" }],
  },
  "best-manager": {
    quantity: "01",
    quantityUnitKey: "awardsPage.units.individual",
    longDescKey: "awardsPage.desc.bestManager",
    prizes: [{ valueKey: "awardsPage.prizes.bestManager.value", noteKey: "awardsPage.prizes.perAward" }],
  },
  "signature-2025-creator": {
    quantity: "01",
    quantityUnitKey: "awardsPage.units.individualOrTeam",
    longDescKey: "awardsPage.desc.signature",
    prizes: [
      { valueKey: "awardsPage.prizes.signature.individual", noteKey: "awardsPage.prizes.forIndividual" },
      { valueKey: "awardsPage.prizes.signature.team", noteKey: "awardsPage.prizes.forTeam" },
    ],
  },
  mvp: {
    quantity: "01",
    quantityUnitKey: "awardsPage.units.individual",
    longDescKey: "awardsPage.desc.mvp",
    prizes: [{ valueKey: "awardsPage.prizes.mvp.value", noteKey: "awardsPage.prizes.perAward" }],
  },
};
