import type { BandKey } from "@enem-quiz/shared/domain";
import { cn } from "@/lib/utils";

export const bandStyles: Record<BandKey, { badge: string; text: string; fill: string }> = {
  starting: {
    badge: "bg-band-starting-soft text-band-starting border-band-starting-line",
    text: "text-band-starting",
    fill: "var(--band-starting)",
  },
  building: {
    badge: "bg-band-building-soft text-band-building border-band-building-line",
    text: "text-band-building",
    fill: "var(--band-building)",
  },
  on_track: {
    badge: "bg-band-on-track-soft text-band-on-track border-band-on-track-line",
    text: "text-band-on-track",
    fill: "var(--band-on-track)",
  },
  final_stretch: {
    badge: "bg-band-final-soft text-band-final border-band-final-line",
    text: "text-band-final",
    fill: "var(--band-final)",
  },
};

export function BandBadge({
  band,
  className,
}: {
  band: { key: BandKey; label: string };
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        bandStyles[band.key].badge,
        className,
      )}
    >
      {band.label}
    </span>
  );
}
