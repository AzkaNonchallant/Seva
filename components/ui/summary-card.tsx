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

const TONES: Record<Tone, { card: string; icon: string; text: string; muted: string }> = {
  primary: {
    card: "bg-primary text-white",
    icon: "bg-white/15 text-white",
    text: "text-white",
    muted: "text-white/75",
  },
  accent: {
    card: "bg-secondary text-white",
    icon: "bg-white/15 text-white",
    text: "text-white",
    muted: "text-white/75",
  },
  neutral: {
    card: "bg-surface-container-lowest",
    icon: SUMMARY_TONES.neutral,
    text: "text-on-surface",
    muted: "text-tertiary",
  },
  success: {
    card: "bg-surface-container-lowest",
    icon: SUMMARY_TONES.success,
    text: "text-on-surface",
    muted: "text-tertiary",
  },
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
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", styles.icon)}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {icon}
          </span>
        </span>
        {badge}
      </div>
      <p className={cn("text-label-md", styles.muted)}>{label}</p>
      <p className={cn("mt-0.5 text-headline-md font-bold", styles.text)}>
        {typeof value === "number" ? value : value}
      </p>
      {footnote ? (
        <p className={cn("mt-1.5 text-caption", styles.muted)}>{footnote}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "flex flex-col rounded-2xl p-md shadow-ambient ring-1 ring-outline-variant/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-float",
          styles.card,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl p-md shadow-ambient ring-1 ring-outline-variant/15",
        styles.card,
      )}
    >
      {content}
    </div>
  );
}

export { formatIDRCompact };
