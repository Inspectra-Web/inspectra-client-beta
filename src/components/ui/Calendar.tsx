import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/cn";

/**
 * shadcn/ui Calendar: react-day-picker with its stylesheet replaced by our own
 * classNames, so it inherits the semantic tokens and both themes rather than
 * shipping a second palette. The upstream `style.css` is deliberately not imported.
 *
 * Every class key below is a UI element of day-picker v10 (see its `UI` enum). The
 * selected day uses the brand accent with `text-[#04121f]` ink for the same reason
 * the realtor seal does: brand is a light blue and white fails contrast on it.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold text-ink",
        nav: "flex items-center gap-1 absolute right-1 top-0 z-10",
        button_previous:
          "inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-40",
        button_next:
          "inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:pointer-events-none disabled:opacity-40",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-faint",
        week: "mt-1 flex w-full",
        day: "size-9 p-0 text-center text-sm",
        day_button:
          "size-9 rounded-lg font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-40",
        selected:
          "[&>button]:bg-brand [&>button]:text-[#04121f] [&>button]:font-semibold [&>button]:hover:bg-brand",
        today: "[&>button]:ring-1 [&>button]:ring-brand/50",
        outside: "[&>button]:text-faint",
        disabled: "[&>button]:text-faint",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        // The one SVG day-picker draws itself, swapped for the icon set the rest of
        // the app uses so the arrows match every other control.
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" {...rest} />
          ) : (
            <ChevronRight className="size-4" {...rest} />
          ),
      }}
      // The caption sits centred with the nav absolutely positioned over its right,
      // which needs the month block to be the positioning context.
      style={{ position: "relative" }}
      {...props}
    />
  );
}
