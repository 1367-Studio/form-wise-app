// components/ui/CenteredSpinner.tsx
import { Loader2 } from "lucide-react";

type CenteredSpinnerProps = {
  label?: string;
  /** If true, applies h-screen to center the spinner across the entire viewport. Defaults to false. */
  fullScreen?: boolean;
};

export default function CenteredSpinner({
  label = "Chargement...",
  fullScreen = true,
}: CenteredSpinnerProps) {
  // Conditionally apply the h-screen class
  const heightClass = fullScreen ? "h-screen" : "";

  // The base classes (flex, centering, text style) are always applied
  // heightClass is added only if fullScreen is true
  return (
    <div
      className={`flex flex-col items-center justify-center text-muted-foreground ${heightClass}`}
    >
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p>{label}</p>
    </div>
  );
}
