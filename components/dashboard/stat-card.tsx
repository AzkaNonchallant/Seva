import { Card } from "@/components/ui/card";
import { SUMMARY_TONES } from "@/components/ui/summary-card";
import { cn, formatNumber } from "@/lib/utils";

/**
 * Dense KPI tile for the Super Admin overview.
 *
 * A row of these, rather than a chart, is the right shape for counts of master
 * data: the numbers are small integers and the comparison is between columns,
 * not across time. The chip colours come from `SUMMARY_TONES` so this tile and
 * the Admin Travel `SummaryCard` read as the same component family.
 */
type Tone = keyof typeof SUMMARY_TONES;

const VALUES: Record<Tone, string> = {
  primary: "text-primary",
  accent: "text-secondary",
  neutral: "text-on-surface",
  success: "text-success",
};

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  caption,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  tone?: Tone;
  caption?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            SUMMARY_TONES[tone],
          )}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {icon}
          </span>
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-headline-lg-mobile font-bold md:text-headline-lg",
          VALUES[tone],
        )}
      >
        {formatNumber(value)}
      </p>
      {caption ? (
        <p className="mt-1 text-caption text-tertiary">{caption}</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Card className="transition-shadow hover:shadow-float">
        <a href={href} className="block p-md">
          {body}
        </a>
      </Card>
    );
  }

  return <Card className="p-md">{body}</Card>;
}
