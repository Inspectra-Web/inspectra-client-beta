import { useEffect } from "react";
import { useLocation } from "react-router";

/** Reset scroll to the top on every route change (ignores in-page hashes). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
