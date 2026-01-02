"use client";

import { cn } from "@plop/ui/cn";
import { Button } from "@plop/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@plop/ui/dropdown-menu";
import { Skeleton } from "@plop/ui/skeleton";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AlignJustify, ArrowUpDown, ChevronDown, List } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useInboxFilterParams } from "@/hooks/use-inbox-filter-params";
import { InboxFilters } from "./inbox-filters";
import { InboxFilterChips } from "./inbox-filter-chips";

function formatReceivedAt(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

const shortDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatReceivedAtShort(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return shortDateTimeFormatter.format(date);
}

function buildHtmlDocument(html: string) {
  return `<!doctype html><html><head><meta charset="utf-8" /><base target="_blank" /></head><body>${html}</body></html>`;
}

const numberFormatter = new Intl.NumberFormat("en-US");

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "sender", label: "Sender A-Z" },
  { value: "subject", label: "Subject A-Z" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

const pageSizeOptions = [50, 100, 200] as const;

type DensityOption = "comfortable" | "compact";

export function InboxView() {
  const trpc = useTRPC();
  const { filter, setFilter, hasFilters } = useInboxFilterParams();
  const { data: mailboxes = [] } = useQuery(
    trpc.inbox.mailboxes.list.queryOptions(),
  );

  const mailboxFilter = filter.mailbox ?? null;
  const tagFilters = Array.isArray(filter.tags) ? filter.tags : [];
  const startDate = filter.start ?? null;
  const endDate = filter.end ?? null;
  const query = filter.q ?? "";
  const deferredQuery = useDeferredValue(query);

  const [sort, setSort] = useState<SortOption>("newest");
  const [pageSize, setPageSize] =
    useState<(typeof pageSizeOptions)[number]>(50);
  const [density, setDensity] = useState<DensityOption>("comfortable");
  const [pageCount, setPageCount] = useState(1);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

  const { data: tagOptions = [], isLoading: tagsLoading } = useQuery(
    trpc.inbox.tags.list.queryOptions({
      mailboxId: mailboxFilter ?? undefined,
    }),
  );

  const listInput = useMemo(() => {
    const normalizedQuery = deferredQuery.trim();
    return {
      mailboxId: mailboxFilter ?? undefined,
      q: normalizedQuery.length > 0 ? normalizedQuery : undefined,
      tags: tagFilters.length > 0 ? tagFilters : undefined,
      start: startDate ?? undefined,
      end: endDate ?? undefined,
    };
  }, [mailboxFilter, deferredQuery, tagFilters, startDate, endDate]);

  const listKey = useMemo(
    () => JSON.stringify({ ...listInput, sort, pageSize }),
    [listInput, sort, pageSize],
  );

  useEffect(() => {
    setPageCount(1);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [listKey]);

  const pageOffsets = useMemo(
    () =>
      Array.from({ length: pageCount }, (_value, index) => index * pageSize),
    [pageCount, pageSize],
  );

  const messageQueries = useQueries({
    queries: pageOffsets.map((offset) => ({
      ...trpc.inbox.messages.list.queryOptions({
        ...listInput,
        sort,
        limit: pageSize,
        offset,
      }),
    })),
  });

  const messages = useMemo(
    () => messageQueries.flatMap((query) => query.data ?? []),
    [messageQueries],
  );

  const primaryMessagesQuery = messageQueries[0];
  const messagesLoading = Boolean(primaryMessagesQuery?.isLoading);
  const messagesFetching = messageQueries.some((query) => query.isFetching);

  const { data: countData } = useQuery({
    ...trpc.inbox.messages.count.queryOptions(listInput),
  });

  useEffect(() => {
    if (!mailboxFilter || mailboxes.length === 0) return;
    const exists = mailboxes.some((mailbox) => mailbox.id === mailboxFilter);
    if (!exists) {
      setFilter({ mailbox: null });
    }
  }, [mailboxFilter, mailboxes, setFilter]);

  useEffect(() => {
    if (tagsLoading || tagFilters.length === 0 || tagOptions.length === 0) {
      return;
    }
    const validTags = tagFilters.filter((tag) => tagOptions.includes(tag));
    if (validTags.length !== tagFilters.length) {
      setFilter({ tags: validTags.length > 0 ? validTags : null });
    }
  }, [setFilter, tagFilters, tagOptions, tagsLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      setSelectedMessageId(null);
      return;
    }

    const stillExists = messages.some((msg) => msg.id === selectedMessageId);
    if (!selectedMessageId || !stillExists) {
      const [firstMessage] = messages;
      if (firstMessage) {
        setSelectedMessageId(firstMessage.id);
      }
    }
  }, [messages, selectedMessageId]);

  const {
    data: message,
    isLoading: messageLoading,
    isFetching: messageFetching,
  } = useQuery({
    ...trpc.inbox.messages.get.queryOptions({ id: selectedMessageId ?? "" }),
    enabled: Boolean(selectedMessageId),
  });

  const htmlDocument = useMemo(() => {
    if (!message?.htmlContent) return null;
    return buildHtmlDocument(message.htmlContent);
  }, [message?.htmlContent]);

  const totalCount = countData?.count ?? null;
  const hasMore =
    typeof totalCount === "number"
      ? messages.length < totalCount
      : (messageQueries[messageQueries.length - 1]?.data?.length ?? 0) ===
        pageSize;
  const resultLabel = messagesLoading
    ? "Loading messages..."
    : typeof totalCount === "number"
      ? `Showing ${numberFormatter.format(messages.length)} of ${numberFormatter.format(totalCount)} messages`
      : `${numberFormatter.format(messages.length)} messages`;

  const sortLabel =
    sortOptions.find((option) => option.value === sort)?.label ??
    "Newest first";
  const densityLabel = density === "compact" ? "Compact" : "Comfortable";
  const itemPadding = density === "compact" ? "py-2" : "py-3";
  const metaText = density === "compact" ? "text-[11px]" : "text-xs";
  const dateText = density === "compact" ? "text-[10px]" : "text-xs";

  const lastMessagesQuery = messageQueries[messageQueries.length - 1];
  const isLoadingMore =
    messageQueries.length > 1 && Boolean(lastMessagesQuery?.isLoading);

  const showMailboxColumn = mailboxFilter === null;
  const showMessagesSkeleton = messagesLoading && messages.length === 0;
  const showPreviewSkeleton =
    messagesLoading ||
    (Boolean(selectedMessageId) && (messageLoading || messageFetching));

  const clearFilters = () =>
    setFilter({
      q: null,
      mailbox: null,
      tags: null,
      start: null,
      end: null,
    });

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[240px] flex-1">
            <InboxFilters
              mailboxes={mailboxes}
              tags={tagOptions}
              mailboxId={mailboxFilter}
              selectedTags={tagFilters}
              startDate={startDate}
              endDate={endDate}
              query={query}
              hasFilters={hasFilters}
              onMailboxChange={(value) => setFilter({ mailbox: value })}
              onTagsChange={(value) => setFilter({ tags: value })}
              onStartDateChange={(value) => setFilter({ start: value })}
              onEndDateChange={(value) => setFilter({ end: value })}
              onQueryChange={(value) =>
                setFilter({ q: value.trim().length > 0 ? value : null })
              }
              onClearFilters={clearFilters}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-2 text-xs"
              >
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[140px] truncate">{sortLabel}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(value) => setSort(value as SortOption)}
              >
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-2 text-xs"
              >
                <List className="h-4 w-4 text-muted-foreground" />
                <span>Show {pageSize}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup
                value={String(pageSize)}
                onValueChange={(value) =>
                  setPageSize(Number(value) as (typeof pageSizeOptions)[number])
                }
              >
                {pageSizeOptions.map((option) => (
                  <DropdownMenuRadioItem key={option} value={String(option)}>
                    {option} per page
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-2 text-xs"
              >
                <AlignJustify className="h-4 w-4 text-muted-foreground" />
                <span>{densityLabel}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuRadioGroup
                value={density}
                onValueChange={(value) => setDensity(value as DensityOption)}
              >
                <DropdownMenuRadioItem value="comfortable">
                  Comfortable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">
                  Compact
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{resultLabel}</span>
          <div className="flex items-center gap-2">
            {messagesFetching ? <span>Updating...</span> : null}
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            ) : null}
          </div>
        </div>

        <InboxFilterChips
          mailboxes={mailboxes}
          query={filter.q}
          mailboxId={mailboxFilter}
          tags={filter.tags}
          startDate={filter.start}
          endDate={filter.end}
          onRemove={(filters) => setFilter(filters)}
        />
      </div>

      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <div className="border">
            <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
              <span>Messages</span>
              {typeof totalCount === "number" ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {numberFormatter.format(totalCount)}
                </span>
              ) : null}
            </div>
            <div
              ref={listRef}
              className="lg:max-h-[calc(100vh-340px)] lg:overflow-y-auto"
            >
              {showMessagesSkeleton ? (
                <div className="space-y-3 p-3">
                  {[
                    "message-skeleton-1",
                    "message-skeleton-2",
                    "message-skeleton-3",
                    "message-skeleton-4",
                    "message-skeleton-5",
                    "message-skeleton-6",
                  ].map((key) => (
                    <div key={key} className="border-b pb-3">
                      <Skeleton className="h-4 w-[70%]" />
                      <Skeleton className="mt-2 h-3 w-[45%]" />
                      <Skeleton className="mt-1 h-3 w-[35%]" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  {hasFilters
                    ? "No messages match these filters."
                    : "No messages yet."}
                </div>
              ) : (
                messages.map((msg) => {
                  const isActive = msg.id === selectedMessageId;

                  return (
                    <button
                      key={msg.id}
                      type="button"
                      className={cn(
                        "group w-full border-b px-3 text-left text-sm transition",
                        itemPadding,
                        isActive
                          ? "bg-muted ring-1 ring-inset ring-border"
                          : "hover:bg-muted/60",
                      )}
                      onClick={() => setSelectedMessageId(msg.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                              {msg.subject ?? "(no subject)"}
                            </span>
                            {msg.tag ? (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                                {msg.tag}
                              </span>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "truncate text-muted-foreground",
                              metaText,
                            )}
                          >
                            {msg.from}
                          </div>
                          {showMailboxColumn ? (
                            <div
                              className={cn(
                                "truncate text-muted-foreground",
                                metaText,
                              )}
                            >
                              {msg.mailboxWithTag}
                            </div>
                          ) : null}
                        </div>
                        <div
                          className={cn(
                            "shrink-0 text-muted-foreground",
                            dateText,
                          )}
                        >
                          {formatReceivedAtShort(msg.receivedAt)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {messages.length > 0 ? (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!hasMore || isLoadingMore}
                  onClick={() => setPageCount((value) => value + 1)}
                >
                  {isLoadingMore
                    ? "Loading more..."
                    : hasMore
                      ? "Load more messages"
                      : "End of list"}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="border">
            <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
              <span>Preview</span>
              {message ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {formatReceivedAt(message.receivedAt)}
                </span>
              ) : null}
            </div>
            {showPreviewSkeleton ? (
              <div className="space-y-3 p-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[60%]" />
                  <Skeleton className="h-3 w-[40%]" />
                  <Skeleton className="h-3 w-[45%]" />
                  <Skeleton className="h-3 w-[50%]" />
                  <Skeleton className="h-3 w-[35%]" />
                </div>
                <Skeleton className="h-[520px] w-full" />
              </div>
            ) : message ? (
              <div className="lg:max-h-[calc(100vh-340px)] space-y-3 p-3 lg:overflow-y-auto">
                <div className="space-y-1">
                  <div className="text-base font-semibold">
                    {message.subject ?? "(no subject)"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    From {message.from}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    To {message.to}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Mailbox {message.mailboxWithTag}
                    {message.domain ? `@${message.domain}` : ""}
                  </div>
                </div>

                {htmlDocument ? (
                  <iframe
                    key={message.id}
                    title={message.subject ?? "Email preview"}
                    className="h-[420px] w-full border bg-white sm:h-[520px] lg:h-[calc(100vh-460px)]"
                    sandbox="allow-same-origin"
                    referrerPolicy="no-referrer"
                    srcDoc={htmlDocument}
                  />
                ) : (
                  <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap border bg-muted/30 p-3 text-xs sm:max-h-[520px] lg:max-h-[calc(100vh-460px)]">
                    {message.textContent ?? "No preview available."}
                  </pre>
                )}
              </div>
            ) : (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                Select a message to preview.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
