import { Outlet, useLocation } from "react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { cn } from "@/lib/cn";

export function RootLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ScrollToTop />
      <Header />
      {/* Home's hero sits under the fixed transparent header; other pages need offset. */}
      <main className={cn("flex-1", !isHome && "pt-16")}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
