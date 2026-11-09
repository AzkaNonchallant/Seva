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
        // Placeholder is text, so it is graded against AA (4.5:1), not the 3:1
        // that `outline` — the token this used to share — is tuned for. On the
        // field surface `outline` measures 4.03:1 and fails; `tertiary` is the
        // token the caption/hint text already uses and clears it at 6.03:1.
        "h-11 w-full rounded-xl px-3.5 text-body-md shadow-sm shadow-transparent transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out placeholder:text-tertiary hover:border-primary/40 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:bg-surface focus-visible:shadow-[0_0_0_4px_rgb(83_70_152/0.14)] motion-reduce:transition-none",
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
        "h-11 w-full rounded-xl px-3.5 text-body-md text-on-surface shadow-sm shadow-transparent transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:border-primary/40 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:bg-surface focus-visible:shadow-[0_0_0_4px_rgb(83_70_152/0.14)] motion-reduce:transition-none",
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
        // Same reason as Input: placeholder has to clear AA on the field surface.
        "min-h-28 w-full resize-y rounded-xl px-3.5 py-3 text-body-md placeholder:text-tertiary shadow-sm shadow-transparent transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:border-primary/40 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:bg-surface focus-visible:shadow-[0_0_0_4px_rgb(83_70_152/0.14)] motion-reduce:transition-none",
        invalid && "border-error",
        className,
      )}
      {...rest}
    />
  );
}
