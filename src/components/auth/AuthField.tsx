import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

interface FieldBase extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: React.ReactNode;
}

/**
 * Label + Input + inline error, wired for React Hook Form (forwardRef, spreads register()).
 * Establishes the app's first form-field pattern over the shadcn-style Input primitive.
 */
export const AuthField = React.forwardRef<HTMLInputElement, FieldBase>(
  function AuthField({ label, error, hint, id, className, ...props }, ref) {
    const fieldId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={fieldId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
          {hint}
        </div>
        <Input
          id={fieldId}
          ref={ref}
          aria-invalid={!!error}
          className={cn(error && "border-rose-400 focus-visible:ring-rose-400/25", className)}
          {...props}
        />
        {error && <p className="text-[13px] text-rose-500">{error}</p>}
      </div>
    );
  },
);

/** Password field with an inline show/hide toggle inside the pill. */
export const PasswordField = React.forwardRef<HTMLInputElement, FieldBase>(
  function PasswordField({ label, error, hint, id, className, ...props }, ref) {
    const [show, setShow] = React.useState(false);
    const fieldId = id ?? props.name;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={fieldId} className="text-sm font-medium text-ink">
            {label}
          </label>
          {hint}
        </div>
        <div className="relative">
          <Input
            id={fieldId}
            ref={ref}
            type={show ? "text" : "password"}
            aria-invalid={!!error}
            className={cn(
              "pr-11",
              error && "border-rose-400 focus-visible:ring-rose-400/25",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-faint transition-colors hover:text-ink"
          >
            {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
        {error && <p className="text-[13px] text-rose-500">{error}</p>}
      </div>
    );
  },
);
