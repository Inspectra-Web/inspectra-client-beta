import { useState } from "react";
import { Outlet } from "react-router";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { RealtorSidebar } from "@/components/realtor/RealtorSidebar";
import { RealtorTopbar } from "@/components/realtor/RealtorTopbar";

/**
 * Full-viewport realtor dashboard shell: a persistent sidebar rail + sticky topbar, with the
 * routed page in the main area. Rendered outside RootLayout (its own chrome, no marketing
 * header/footer). Below lg the sidebar collapses into a slide-in drawer.
 */
export function RealtorDashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg">
      <ScrollToTop />

      {/* desktop rail */}
      <aside className="w-64 shrink-0 border-r border-line bg-surface max-lg:hidden">
        <div className="sticky top-0 h-screen">
          <RealtorSidebar />
        </div>
      </aside>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <div key="drawer" className="fixed inset-0 z-50 hidden max-lg:block">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-surface shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-5 z-10 text-muted hover:text-ink"
              >
                <X className="size-6" />
              </button>
              <RealtorSidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <RealtorTopbar onOpenMenu={() => setOpen(true)} />
        <main className="flex-1 px-8 py-8 max-lg:px-6 max-sm:px-5 max-sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
