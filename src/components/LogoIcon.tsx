import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Formwise icon mark (square with arch cut-out). Inherits `currentColor`, so
 * control the colour with a text utility — defaults to the brand blue.
 */
export default function LogoIcon({
  className = "",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 92 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn("text-[#003EA3]", className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0H92V92H0V0ZM20.7 92V61.18C20.7 54.47 23.3655 48.0349 28.1102 43.2902C32.8549 38.5455 39.29 35.88 46 35.88C52.71 35.88 59.1451 38.5455 63.8898 43.2902C68.6345 48.0349 71.3 54.47 71.3 61.18V92H20.7Z"
        fill="currentColor"
      />
    </svg>
  );
}
