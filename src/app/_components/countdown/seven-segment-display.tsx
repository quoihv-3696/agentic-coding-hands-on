/**
 * Renders a numeric string (e.g. "07") as LED digit cells.
 *
 * Each digit sits in a frosted-glass rounded box (white gradient fill, pale-gold
 * border, backdrop blur) per the Figma design, with the digit drawn in the
 * "Digital Numbers" seven-segment face. Pure presentational — no interactivity.
 */
export function SevenSegmentDisplay({ value }: { value: string }) {
  return (
    <div
      role="img"
      aria-label={value}
      className="flex gap-[clamp(0.5rem,1.4vw,1.3125rem)]"
    >
      {value.split("").map((char, index) => (
        <span
          key={`${index}-${char}`}
          aria-hidden
          className="relative inline-flex h-[clamp(5rem,9vw,7.68rem)] w-[clamp(3.125rem,5.6vw,4.8rem)] items-center justify-center"
        >
          {/* Frosted-glass cell */}
          <span
            className="absolute inset-0 rounded-xl border-[0.75px] border-[#FFEA9E] opacity-50 backdrop-blur-[25px]"
            style={{
              background:
                "linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)",
            }}
          />
          {/* Digit */}
          <span className="relative font-digital text-[clamp(3rem,5.4vw,4.6rem)] leading-none text-white">
            {char}
          </span>
        </span>
      ))}
    </div>
  );
}
