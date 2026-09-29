import { cn, formatIDRCompact } from "@/lib/utils";

type Tone = "primary" | "accent" | "neutral" | "success";

/**
 * The chip palette, exported so a second KPI component — `StatCard` in the
 * Super Admin area — reuses the same colour assignment rather than inventing
 * its own.
 */
export const SUMMARY_TONES: Record<Tone, string> = {
  primary: "bg-primary-container/20 text-primary",
  accent: "bg-secondary-fixed text-on-secondary-fixed",
  neutral: "bg-surface-container-high text-tertiary",
  success: "bg-success-container text-success",
};

const TONES: Record<Tone, { icon: string; chip: string }> = {
  primary: { icon: "", chip: SUMMARY_TONES.primary },
  accent: { icon: "", chip: SUMMARY_TONES.accent },
  neutral: { icon: "", chip: SUMMARY_TONES.neutral },
  success: { icon: "", chip: SUMMARY_TONES.success },
};

/**
 * KPI tile. DESIGN.md notes the "airy" feel is the exception for dashboards,
 * which use `sm`/`md` spacing to keep density high while staying rounded.
 */
export function SummaryCard({
  label,
  value,
  icon,
  tone = "primary",
  footnote,
  badge,
  href,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: Tone;
  footnote?: string;
  badge?: React.ReactNode;
  href?: string;
}) {
  const styles = TONES[tone];
  const content = (
    <>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn("flex h-9 w-9 items-center justify-center rounded-lg", styles.chip)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {icon}
          </span>
        </span>
        {badge}
      </div>
      <p className="text-label-md text-on-surface-variant">{label}</p>
      <p className="mt-0.5 text-headline-md font-bold text-on-surface">
        {typeof value === "number" ? value : value}
      </p>
      {footnote ? (
        <p className="mt-1.5 text-caption text-tertiary">{footnote}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex flex-col rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15 transition-shadow hover:shadow-float"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl bg-surface-container-lowest p-md shadow-ambient ring-1 ring-outline-variant/15">
      {content}
    </div>
  );
}

export { formatIDRCompact };
