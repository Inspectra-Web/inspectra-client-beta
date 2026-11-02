import { NavLink } from "react-router";

import { cn } from "@/lib/cn";

const TABS = [
  { label: "Course", to: "/admin/course", end: true },
  { label: "Enrollments", to: "/admin/course/enrollments", end: false },
];

/** Switches between the course editor and the people who bought it. */
export function CourseTabs() {
  return (
    <nav aria-label="Course sections" className="flex gap-6 border-b border-line">
      {TABS.map(({ label, to, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              isActive ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
