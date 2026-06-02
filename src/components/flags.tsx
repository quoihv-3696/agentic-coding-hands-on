import { useId, type SVGProps } from "react";

export function VietnamFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        points="15,3 16.76,8.42 22.49,8.42 17.86,11.58 19.62,17 15,13.84 10.38,17 12.14,11.58 7.51,8.42 13.24,8.42"
        fill="#FFFF00"
      />
    </svg>
  );
}

export function UkFlag(props: SVGProps<SVGSVGElement>) {
  const clipId = useId();
  return (
    <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" {...props}>
      <clipPath id={clipId}>
        <rect width="60" height="40" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFF" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 V40 M0,20 H60" stroke="#FFF" strokeWidth="12" />
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}
