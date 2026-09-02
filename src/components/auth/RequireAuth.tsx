import { Navigate, Outlet, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

import { useMe, type AuthRole } from "@/lib/auth";
import { Unauthorized } from "@/pages/Unauthorized";

function SessionPending() {
  return (
    <div className="grid min-h-svh place-items-center bg-bg">
      <Loader2 className="size-6 animate-spin text-muted" aria-hidden />
      <span className="sr-only">Checking your session</span>
    </div>
  );
}

export function RequireAuth({ roles }: { roles?: AuthRole[] }) {
  const { data: user, isPending } = useMe();
  const location = useLocation();

  if (isPending) return <SessionPending />;

  if (!user)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );

  if (roles && !roles.includes(user.role)) return <Unauthorized />;

  return <Outlet />;
}
