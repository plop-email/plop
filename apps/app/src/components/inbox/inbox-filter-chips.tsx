"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@plop/ui/button";

type MailboxOption = {
  id: string;
  name: string;
  domain?: string | null;
};

type InboxFilterChipsProps = {
  mailboxes: MailboxOption[];
  query: string | null;
  mailboxId: string | null;
  tags: string[] | null;
  startDate: string | null;
  endDate: string | null;
  onRemove: (filters: {
    q?: null;
    mailbox?: null;
    tags?: null;
    start?: null;
    end?: null;
  }) => void;
};
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(value: string) {
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts.map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return value;
  const monthLabel = MONTH_LABELS[month - 1];
  if (!monthLabel) return value;
  return `${monthLabel} ${day}, ${year}`;
}

export function InboxFilterChips({
  mailboxes,
  query,
  mailboxId,
  tags,
  startDate,
  endDate,
  onRemove,
}: InboxFilterChipsProps) {
  const mailboxLabel = mailboxId
    ? mailboxes.find((mailbox) => mailbox.id === mailboxId)
    : null;
  const mailboxText = mailboxLabel
    ? mailboxLabel.domain
      ? `${mailboxLabel.name}@${mailboxLabel.domain}`
      : mailboxLabel.name
    : mailboxId;
  const hasTags = Boolean(tags && tags.length > 0);
  const hasDateRange = Boolean(startDate || endDate);
  const dateLabel = hasDateRange
    ? startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : startDate
        ? `From ${formatDate(startDate)}`
        : endDate
          ? `Until ${formatDate(endDate)}`
          : null
    : null;

  const chips = [
    query
      ? {
          key: "q",
          label: query,
          onClick: () => onRemove({ q: null }),
        }
      : null,
    mailboxId
      ? {
          key: "mailbox",
          label: mailboxText ?? "Mailbox",
          onClick: () => onRemove({ mailbox: null }),
        }
      : null,
    hasTags
      ? {
          key: "tags",
          label: tags?.join(", ") ?? "Tags",
          onClick: () => onRemove({ tags: null }),
        }
      : null,
    dateLabel
      ? {
          key: "date",
          label: dateLabel,
          onClick: () => onRemove({ start: null, end: null }),
        }
      : null,
  ].filter(Boolean) as {
    key: string;
    label: string;
    onClick: () => void;
  }[];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.div
            key={chip.key}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="group h-9 px-2 font-normal text-muted-foreground hover:bg-secondary"
              onClick={chip.onClick}
            >
              <X className="h-3 w-0 opacity-0 transition-all group-hover:w-3 group-hover:opacity-100" />
              <span className="max-w-[240px] truncate">{chip.label}</span>
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
