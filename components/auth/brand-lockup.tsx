import { cn } from "@/lib/utils";

/**
 * The Horizon Odyssey wordmark.
 *
 * DESIGN.md keeps the brand on photographic surfaces, so the mark is a glass
 * tile rather than a flat logo. It exists as its own component because it
 * appears twice at different scales: on the full-height photo panel from `lg`
 * up, and on the short photo band that stands in for that panel on a phone.
 */
export function BrandLockup({
  variant = "panel",
  className,
}: {
  variant?: "panel" | "band";
  className?: string;
}) {
  const tall = variant === "panel";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-md",
          tall ? "h-11 w-11" : "h-9 w-9",
        )}
      >
        <span
          className="material-symbols-outlined text-white"
          style={{ fontSize: tall ? 24 : 20 }}
        >
          flight_takeoff
        </span>
      </span>
      <div className="leading-tight">
        <p
          className={cn(
            "font-bold tracking-tight text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
            tall ? "text-headline-md" : "text-body-lg",
          )}
        >
          Horizon Odyssey
        </p>
        <p className="text-caption text-white/80">Dinas Travel &middot; PT Andrea</p>
      </div>
    </div>
  );
}
