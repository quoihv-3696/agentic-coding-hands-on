import type { SVGProps } from "react";

// Project icons — sourced from src/assets/icons via SVGR (`?react`).
// Monochrome icons inherit text colour (white -> currentColor in next.config).
export { default as BellIcon } from "@/assets/icons/bell.svg?react";
export { default as UserIcon } from "@/assets/icons/user_profile.svg?react";
export { default as ChevronDownIcon } from "@/assets/icons/down.svg?react";
export { default as GoogleIcon } from "@/assets/icons/google.svg?react";
export { default as DashboardIcon } from "@/assets/icons/dashboard_circle.svg?react";

// No diagonal up-right arrow in the asset set yet — kept inline until one is added.
export function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
