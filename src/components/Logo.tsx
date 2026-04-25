import { Zap } from "lucide-react";

type Tone = "dark" | "light";
type Size = "sm" | "md" | "lg";

const toneClasses: Record<Tone, { icon: string; word: string }> = {
  dark: { icon: "text-black", word: "text-gray-900" },
  light: { icon: "text-white", word: "text-white" },
};

const sizeClasses: Record<Size, { icon: string; word: string }> = {
  sm: { icon: "h-4 w-4", word: "text-base" },
  md: { icon: "h-5 w-5", word: "text-xl" },
  lg: { icon: "h-6 w-6", word: "text-2xl" },
};

export default function Logo({
  tone = "dark",
  size = "md",
  className = "",
}: {
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  const c = toneClasses[tone];
  const s = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tracking-tight ${className}`}
    >
      <Zap className={`${s.icon} ${c.icon}`} strokeWidth={2.5} />
      <span className={`${s.word} ${c.word} leading-none`}>
        form<span className="font-bold">wise</span>
      </span>
    </span>
  );
}
