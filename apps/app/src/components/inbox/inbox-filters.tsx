"use client";

import { useMemo, useState } from "react";
import { Calendar, Filter, Mail, Search, Tag, X } from "lucide-react";
import { cn } from "@plop/ui/cn";
import { Button } from "@plop/ui/button";
import { Input } from "@plop/ui/input";
import { Calendar as DateRangeCalendar } from "@plop/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@plop/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";

type MailboxOption = {
  id: string;
  name: string;
  domain?: string | null;
};

type InboxFiltersProps = {
  mailboxes: MailboxOption[];
  tags: string[];
  mailboxId: string | null;
  selectedTags: string[];
  startDate: Date | null;
  endDate: Date | null;
  query: string;
  hasFilters: boolean;
  onMailboxChange: (value: string | null) => void;
  onTagsChange: (value: string[] | null) => void;
  onStartDateChange: (value: Date | null) => void;
  onEndDateChange: (value: Date | null) => void;
  onQueryChange: (value: string) => void;
  onClearFilters: () => void;
};

const toLocalDate = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const toUtcDate = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const isSameDay = (left?: Date, right?: Date) => {
  if (!left || !right) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

export function InboxFilters({
  mailboxes,
  tags,
  mailboxId,
  selectedTags,
  startDate,
  endDate,
  query,
  hasFilters,
  onMailboxChange,
  onTagsChange,
  onStartDateChange,
  onEndDateChange,
  onQueryChange,
  onClearFilters,
}: InboxFiltersProps) {
  const [open, setOpen] = useState(false);
  const mailboxValue = mailboxId ?? "all";
  const tagValues = selectedTags ?? [];
  const selectedRange = useMemo(() => {
    if (!startDate && !endDate) return undefined;
    return {
      from: startDate ? toLocalDate(startDate) : undefined,
      to: endDate ? toLocalDate(endDate) : undefined,
    };
  }, [startDate, endDate]);

  const activeCount =
    (query.trim().length > 0 ? 1 : 0) +
    (mailboxId ? 1 : 0) +
    (tagValues.length > 0 ? 1 : 0) +
    (startDate || endDate ? 1 : 0);

  const today = startOfDay(new Date());
  const presets: { label: string; range: DateRange }[] = [
    { label: "Today", range: { from: today, to: today } },
    {
      label: "Last 7 days",
      range: { from: addDays(today, -6), to: today },
    },
    {
      label: "Last 30 days",
      range: { from: addDays(today, -29), to: today },
    },
    {
      label: "This month",
      range: { from: startOfMonth(today), to: today },
    },
    {
      label: "Last month",
      range: {
        from: startOfMonth(addDays(startOfMonth(today), -1)),
        to: endOfMonth(addDays(startOfMonth(today), -1)),
      },
    },
  ];

  const applyRange = (range?: DateRange) => {
    if (!range || (!range.from && !range.to)) {
      onStartDateChange(null);
      onEndDateChange(null);
      return;
    }
    onStartDateChange(range.from ? toUtcDate(range.from) : null);
    onEndDateChange(range.to ? toUtcDate(range.to) : null);
  };

  const toggleTag = (value: string) => {
    const next = tagValues.includes(value)
      ? tagValues.filter((tag) => tag !== value)
      : [...tagValues, value];
    onTagsChange(next.length > 0 ? next : null);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search or filter"
          className="pl-9 pr-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onQueryChange("");
            }
          }}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open filters"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground",
              (hasFilters || open) && "text-foreground",
            )}
          >
            <Filter className="h-4 w-4" />
            {activeCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center border bg-background px-1 text-[10px] font-semibold text-foreground">
                {activeCount}
              </span>
            ) : null}
          </button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={12}
        alignOffset={-8}
        className="w-[350px] max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Mail className="h-4 w-4" />
              <span>Mailbox</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="max-h-[320px] overflow-y-auto p-0">
                <DropdownMenuRadioGroup
                  value={mailboxValue}
                  onValueChange={(value) =>
                    onMailboxChange(value === "all" ? null : value)
                  }
                >
                  <DropdownMenuRadioItem value="all">
                    All mailboxes
                  </DropdownMenuRadioItem>
                  {mailboxes.length === 0 ? (
                    <DropdownMenuItem disabled>
                      No mailboxes yet
                    </DropdownMenuItem>
                  ) : (
                    mailboxes.map((mailbox) => {
                      const address = mailbox.domain
                        ? `${mailbox.name}@${mailbox.domain}`
                        : mailbox.name;
                      return (
                        <DropdownMenuRadioItem
                          key={mailbox.id}
                          value={mailbox.id}
                        >
                          {address}
                        </DropdownMenuRadioItem>
                      );
                    })
                  )}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Tag className="h-4 w-4" />
              <span>Tag</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="max-h-[320px] overflow-y-auto p-0">
                {tags.length === 0 ? (
                  <DropdownMenuItem disabled>No tags yet</DropdownMenuItem>
                ) : (
                  tags.map((item) => (
                    <DropdownMenuCheckboxItem
                      key={item}
                      checked={tagValues.includes(item)}
                      onCheckedChange={() => toggleTag(item)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {item}
                    </DropdownMenuCheckboxItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-[320px] max-w-[calc(100vw-2rem)] p-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => {
                      const isActive = Boolean(
                        selectedRange?.from &&
                          selectedRange?.to &&
                          isSameDay(preset.range.from, selectedRange.from) &&
                          isSameDay(preset.range.to, selectedRange.to),
                      );
                      return (
                        <Button
                          key={preset.label}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-9 w-full justify-start text-xs font-medium",
                            isActive && "bg-accent text-accent-foreground",
                          )}
                          onClick={() => applyRange(preset.range)}
                        >
                          {preset.label}
                        </Button>
                      );
                    })}
                  </div>

                  <DateRangeCalendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={applyRange}
                    numberOfMonths={1}
                    defaultMonth={selectedRange?.from}
                    initialFocus
                    className="mx-auto"
                  />
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!hasFilters}
          className="gap-2"
          onSelect={onClearFilters}
        >
          <X className="h-4 w-4" />
          Clear filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
