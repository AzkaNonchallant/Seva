import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

/**
 * DESIGN.md buttons: primary is filled Sky Blue, the high-priority "Book Now"
 * action is Sunset Orange, secondary is a 1.5px blue border, ghost is bare blue
 * text. All of them are 8px radius.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container active:bg-primary-container",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:opacity-90 shadow-sm",
  outline:
    "border-[1.5px] border-primary text-primary hover:bg-primary-fixed/30",
  ghost: "text-primary hover:bg-primary-fixed/40",
  danger:
    "bg-error-container text-on-error-container hover:opacity-90 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-caption gap-1",
  md: "h-10 px-md text-label-md gap-1.5",
  lg: "h-12 px-lg text-label-md gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-lg font-label-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {icon ? (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: size === "sm" ? 16 : 18 }}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
    >
      {icon ? (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: size === "sm" ? 16 : 18 }}
        >
          {icon}
        </span>
      ) : null}
      {children}
    </Link>
  );
}
