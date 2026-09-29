import { cn } from "@/lib/utils";

/** Cards use 16px radius on a white surface with the soft ambient shadow. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface-container-lowest shadow-ambient ring-1 ring-outline-variant/15",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-sm border-b border-outline-variant/20 p-md",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-body-lg font-semibold text-on-surface">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-caption text-on-surface-variant">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-md", className)}>{children}</div>;
}
