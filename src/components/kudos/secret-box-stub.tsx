"use client";

import { useTranslations } from "@/lib/i18n/i18n-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Gift } from "lucide-react";

interface SecretBoxStubProps {
  label: string;
}

export function SecretBoxStub({ label }: SecretBoxStubProps) {
  const { t } = useTranslations();

  function handleOpenGift() {
    toast(t("kudosBoard.secretBox.comingSoon"));
  }

  return (
    <Button
      className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[8px] font-[Montserrat] text-[22px] font-bold leading-[28px] transition-opacity hover:opacity-90"
      style={{
        backgroundColor: "#FFEA9E",
        color: "#00101A",
        fontFamily: "Montserrat, sans-serif",
      }}
      onClick={handleOpenGift}
    >
      <span>{label}</span>
      <Gift className="size-6 shrink-0" style={{ color: "#00101A" }} />
    </Button>
  );
}
