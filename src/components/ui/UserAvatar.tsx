import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/**
 * Avatar with an initials fallback. Every new account starts with avatar: "",
 * so the fallback is the common case, not the edge case.
 */
export function UserAvatar({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar?: string;
  className?: string;
}) {
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-line", className)}
      />
    );

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-brand-ink ring-1 ring-line",
        className,
      )}
    >
      <span aria-hidden>{initials(name)}</span>
      <span className="sr-only">{name}</span>
    </span>
  );
}
