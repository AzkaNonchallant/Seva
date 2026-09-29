import { cn } from "@/lib/utils";

type Tone = "neutral" | "primary" | "success" | "warning" | "error" | "accent";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-container-high text-on-surface-variant",
  primary: "bg-primary-fixed text-on-primary-fixed",
  success: "bg-success-container text-success",
  warning: "bg-warning-container text-warning",
  error: "bg-error-container text-on-error-container",
  accent: "bg-secondary-fixed text-on-secondary-fixed",
};

/** Neutral, hairline-outlined chip for information that is not a state. */
const GHOST = "border border-outline-variant/40 bg-transparent text-on-surface-variant";

const DOTS: Record<Tone, string> = {
  neutral: "bg-outline",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  accent: "bg-secondary-container",
};

/** Pill-shaped tags, kept circular to separate them from structural elements. */
export function Badge({
  tone = "neutral",
  variant = "filled",
  dot,
  icon,
  className,
  children,
}: {
  tone?: Tone;
  /** `outline` drops the fill for tertiary metadata such as a raw role name. */
  variant?: "filled" | "outline";
  dot?: boolean;
  icon?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-caption font-medium",
        variant === "outline" ? GHOST : TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[tone])} />
      ) : null}
      {icon ? (
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
