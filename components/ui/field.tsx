import { cn } from "@/lib/utils";

/** Soft gray field with a blue focus stroke, per DESIGN.md input styling. */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  trailing,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  /** Sits on the label row, opposite the label. Used for a "lupa password" link. */
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-label-md font-medium text-on-surface"
        >
          {label}
          {required ? <span className="ml-0.5 text-error">*</span> : null}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-caption text-error" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  invalid,
  className,
  ...rest
}: { invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full px-3 text-body-md placeholder:text-outline focus:shadow-[0_0_0_3px_rgb(0_89_187/0.2)]",
        invalid && "border-error focus:border-error focus:shadow-[0_0_0_3px_rgb(186_26_26/0.15)]",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: { invalid?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full px-3 text-body-md text-on-surface focus:shadow-[0_0_0_3px_rgb(0_89_187/0.2)]",
        invalid && "border-error",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Textarea({
  invalid,
  className,
  ...rest
}: { invalid?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full resize-y px-3 py-2 text-body-md placeholder:text-outline focus:shadow-[0_0_0_3px_rgb(0_89_187/0.2)]",
        invalid && "border-error",
        className,
      )}
      {...rest}
    />
  );
}
