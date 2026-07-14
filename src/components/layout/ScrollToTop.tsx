import { useEffect } from "react";
import { useLocation } from "react-router";

/** Reset scroll to the top on every route change (ignores in-page hashes). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    // Jump instantly on navigation. "instant" overrides the CSS
    // `scroll-behavior: smooth` so only the scroll-to-top button animates.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
