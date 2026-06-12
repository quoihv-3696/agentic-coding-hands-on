"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/button";
import { PenIcon } from "@/components/icons";
import { useKudosComposer } from "@/app/(site)/kudos/_components/kudos-composer";

interface ProfileSendCtaProps {
  recipientProfileId: string;
  recipientName: string;
}

/**
 * Other-profile CTA (Figma A.4): opens the shipped Kudos composer pre-filled with
 * this profile as the recipient. Relies on the KudosComposerProvider mounted by
 * ProfileSections (shared with the feed's hover cards).
 */
export function ProfileSendCta({
  recipientProfileId,
  recipientName,
}: ProfileSendCtaProps) {
  const { t } = useTranslations();
  const composer = useKudosComposer();
  // Function replacement avoids $-pattern expansion if a name contains "$".
  const label = t("profile.sendCta").replace("{name}", () => recipientName);

  return (
    <Button
      variant="secondary"
      onClick={() => composer.open(recipientProfileId, recipientName)}
      leftIcon={<PenIcon className="size-5" />}
      className="h-18 w-full justify-center text-lg rounded-full"
    >
      {label}
    </Button>
  );
}
