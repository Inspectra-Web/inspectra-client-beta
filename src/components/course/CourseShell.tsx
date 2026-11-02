import type { ReactNode } from "react";
import { Link } from "react-router";

import logoPrimary from "@/assets/inspectra-logo-primary-lg.png";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

/** The dark, chrome-free room the course is paid for and watched in. */
export function CourseShell({ aside, children }: { aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-svh bg-[#05121c] text-white">
      <ScrollToTop />
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-8 max-sm:px-5">
          <Link to="/" aria-label="INSPECTRA home">
            <img src={logoPrimary} alt="INSPECTRA" className="h-8 w-auto" />
          </Link>
          {aside}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-8 py-12 max-sm:px-5 max-sm:py-8">{children}</main>
    </div>
  );
}
