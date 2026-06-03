import { formatUnit } from "@/lib/countdown/format";
import { SevenSegmentDisplay } from "./seven-segment-display";

/** One countdown unit: a 2-digit LED display above an uppercase white label. */
export function CountdownUnit({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-start gap-[clamp(0.625rem,1.4vw,1.3125rem)]">
      <SevenSegmentDisplay value={formatUnit(value, max)} />
      <span className="text-[clamp(1.125rem,2.4vw,2.25rem)] font-bold uppercase leading-none text-white">
        {label}
      </span>
    </div>
  );
}
