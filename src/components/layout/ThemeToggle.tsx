import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/cn";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface-2/60 p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-7 place-items-center rounded-full transition-colors",
              active
                ? "bg-surface text-brand shadow-sm"
                : "text-faint hover:text-ink",
            )}
          >
            <Icon className="size-4" strokeWidth={2} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
