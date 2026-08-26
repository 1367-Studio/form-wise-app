import LogoFull from "./LogoFull";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";
type Size = "sm" | "md" | "lg";

// Brand blue on light surfaces, white on dark ones.
const toneClasses: Record<Tone, string> = {
  dark: "text-brand",
  light: "text-white",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-5",
  md: "h-6",
  lg: "h-8",
};

/**
 * Legacy wrapper kept for existing call sites (auth shell). Renders the full
 * SVG logo — prefer importing `LogoFull` / `LogoIcon` directly in new code.
 */
export default function Logo({
  tone = "dark",
  size = "md",
  className = "",
}: {
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  return (
    <LogoFull
      className={cn("w-auto", sizeClasses[size], toneClasses[tone], className)}
    />
  );
}
