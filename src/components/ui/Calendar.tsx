import { createContext, useContext, useState, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DropdownProps } from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/cn";

// Which caption dropdown is open, so opening the month closes the year and the reverse.
// Radix lets two Selects stay open together once the scroll-lock override in index.css
// lets the second trigger take the click.
const OpenDropdown = createContext<{
  open: string | null;
  setOpen: (update: (prev: string | null) => string | null) => void;
}>({ open: null, setOpen: () => {} });

/**
 * captionLayout="dropdown" draws a native <select>, whose list the OS paints in its own
 * style and ignores the theme. This swaps it for our Select. day-picker only reads
 * `target.value` from the change event it hands back.
 */
function Dropdown({ options = [], value, onChange, disabled, "aria-label": label }: DropdownProps) {
  const { open, setOpen } = useContext(OpenDropdown);
  const id = label ?? "";

  return (
    <Select
      open={open === id}
      onOpenChange={(next) => setOpen((prev) => (next ? id : prev === id ? null : prev))}
      value={value === undefined ? undefined : String(value)}
      disabled={disabled}
      onValueChange={(next) =>
        onChange?.({ target: { value: next } } as ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger aria-label={label} className="h-8 w-auto gap-1.5 rounded-lg px-3 font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {options.map((option) => (
          <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <OpenDropdown.Provider value={{ open: openDropdown, setOpen: setOpenDropdown }}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("w-fit", className)}
        classNames={{
          months: "flex flex-col gap-4",
          month: "flex flex-col gap-4",
          month_caption: "flex h-8 items-center justify-center",
          caption_label: "text-sm font-semibold text-ink",
          dropdowns: "flex items-center gap-2",
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
          Dropdown,
        }}
        // The caption sits centred with the nav absolutely positioned over its right,
        // which needs the month block to be the positioning context.
        style={{ position: "relative" }}
        {...props}
      />
    </OpenDropdown.Provider>
  );
}
