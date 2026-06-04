import Image from "next/image";
import vnFlag from "@/assets/icons/vn.svg";
import enFlag from "@/assets/icons/en.svg";

// Flags are multi-colour (incl. white stripes), so they stay as image assets
// rather than currentColor SVGR components.
type FlagProps = { className?: string };

export function VietnamFlag({ className }: FlagProps) {
  return <Image src={vnFlag} alt="" aria-hidden width={24} height={24} className={className} />;
}

export function UkFlag({ className }: FlagProps) {
  return <Image src={enFlag} alt="" aria-hidden width={24} height={24} className={className} />;
}
