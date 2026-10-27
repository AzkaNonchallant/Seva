import Link from "next/link";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

/** Buttons follow DESIGN.md: pill affordance, purple brand hierarchy, no shadow. */
const VARIANTS: Record<Variant, string> = {
  primary: "border-2 border-primary bg-primary text-on-primary hover:bg-primary-container active:bg-primary-container",
  secondary:
    "border-2 border-primary-container bg-primary-container text-on-primary hover:opacity-90",
  outline:
    "border border-primary text-primary hover:bg-primary-fixed/30",
  ghost: "text-primary hover:bg-primary-fixed/40",
  danger:
    "border-2 border-error bg-error-container text-on-error-container hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "min-h-11 px-7 text-caption gap-1",
  md: "h-11 px-7 text-label-md gap-1.5",
  lg: "h-11 px-7 text-label-md gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-label-md font-semibold transition-colors disabled:cursor-not-allowed disabled:border-neutral-2 disabled:bg-neutral-2 disabled:text-tertiary disabled:opacity-100";

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
