"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DayPicker,
  type DayPickerProps,
  getDefaultClassNames,
} from "react-day-picker";
import { cn } from "../utils";
import { buttonVariants } from "./button";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-background p-3", className)}
      classNames={{
        root: cn("relative w-full", defaultClassNames.root),
        months: cn(
          "flex flex-col items-center gap-4 md:flex-row",
          defaultClassNames.months,
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          "flex h-7 w-full items-center justify-center px-7",
          defaultClassNames.month_caption,
        ),
        caption_label: cn(
          "select-none text-sm",
          defaultClassNames.caption_label,
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none text-[0.8rem] font-normal",
          defaultClassNames.weekday,
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center",
          defaultClassNames.day,
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 text-xs font-normal aria-selected:opacity-100",
          defaultClassNames.day_button,
        ),
        selected: cn(
          "bg-primary text-primary-foreground",
          defaultClassNames.selected,
        ),
        range_start: cn(
          "bg-primary text-primary-foreground",
          defaultClassNames.range_start,
        ),
        range_middle: cn(
          "bg-accent text-accent-foreground",
          defaultClassNames.range_middle,
        ),
        range_end: cn(
          "bg-primary text-primary-foreground",
          defaultClassNames.range_end,
        ),
        today: cn("bg-accent text-accent-foreground", defaultClassNames.today),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside,
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled,
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...rest }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft
                className={cn("h-4 w-4", chevronClassName)}
                {...rest}
              />
            );
          }

          return (
            <ChevronRight
              className={cn("h-4 w-4", chevronClassName)}
              {...rest}
            />
          );
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
