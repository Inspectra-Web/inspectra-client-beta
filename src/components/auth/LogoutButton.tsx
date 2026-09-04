import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/cn";
import { useLogout } from "@/lib/auth";

export function LogoutButton({
  onNavigate,
  className,
  to = "/login",
}: {
  onNavigate?: () => void;
  className?: string;
  to?: string;
}) {
  const logout = useLogout();
  const navigate = useNavigate();

  function handleLogout() {
    onNavigate?.();
    navigate(to, { replace: true });
    logout.mutate();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={logout.isPending}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-4.5 shrink-0" aria-hidden />
      Log out
    </button>
  );
}
