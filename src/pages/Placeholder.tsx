import { Link, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";

/** Temporary page for routes not yet built (Phase 2+). Keeps nav links live. */
export function Placeholder({ title }: { title?: string }) {
  const { pathname } = useLocation();
  const name =
    title ?? pathname.replace("/", "").replace(/-/g, " ") ?? "This page";

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="eyebrow">Coming next</span>
      <h1 className="mt-4 font-display text-4xl font-bold capitalize tracking-tight">
        {name || "Page"}
      </h1>
      <p className="mt-3 max-w-md text-muted">
        This page isn't built yet — the landing page is the first piece of INSPECTRA's
        frontend. It's on the roadmap.
      </p>
      <Link to="/" className={buttonClasses("outline", "md", "mt-8")}>
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </Link>
    </Container>
  );
}
