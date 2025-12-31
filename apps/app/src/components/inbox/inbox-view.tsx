"use client";

import { cn } from "@plop/ui/cn";
import { Skeleton } from "@plop/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useInboxFilterParams } from "@/hooks/use-inbox-filter-params";
import { InboxFilters } from "./inbox-filters";
import { InboxFilterChips } from "./inbox-filter-chips";

function formatReceivedAt(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

function buildHtmlDocument(html: string) {
  return `<!doctype html><html><head><meta charset="utf-8" /><base target="_blank" /></head><body>${html}</body></html>`;
}

export function InboxView() {
  const trpc = useTRPC();
  const { filter, setFilter, hasFilters } = useInboxFilterParams();
  const { data: mailboxes = [] } = useQuery(
    trpc.inbox.mailboxes.list.queryOptions(),
  );

  const mailboxFilter =
    filter.mailbox &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      filter.mailbox,
    )
      ? filter.mailbox
      : null;
  const tagFilters = Array.isArray(filter.tags) ? filter.tags : [];
  const startDate = filter.start ?? null;
  const endDate = filter.end ?? null;
  const query = filter.q ?? "";
  const deferredQuery = useDeferredValue(query);

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

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isFetching: messagesFetching,
  } = useQuery({
    ...trpc.inbox.messages.list.queryOptions(listInput),
  });

  useEffect(() => {
    if (filter.mailbox && !mailboxFilter) {
      setFilter({ mailbox: null });
    }
  }, [filter.mailbox, mailboxFilter, setFilter]);

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
    const updates: { start?: null; end?: null } = {};
    if (
      startDate &&
      Number.isNaN(new Date(`${startDate}T00:00:00`).getTime())
    ) {
      updates.start = null;
    }
    if (endDate && Number.isNaN(new Date(`${endDate}T00:00:00`).getTime())) {
      updates.end = null;
    }
    if (Object.keys(updates).length > 0) {
      setFilter(updates);
    }
  }, [startDate, endDate, setFilter]);

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

  const showMailboxColumn = mailboxFilter === null;
  const showMessagesSkeleton =
    messagesLoading || (messagesFetching && messages.length === 0);
  const showPreviewSkeleton =
    messagesLoading ||
    (Boolean(selectedMessageId) && (messageLoading || messageFetching));

  return (
    <div className="space-y-4">
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
        onClearFilters={() =>
          setFilter({
            q: null,
            mailbox: null,
            tags: null,
            start: null,
            end: null,
          })
        }
      />

      <InboxFilterChips
        mailboxes={mailboxes}
        query={filter.q}
        mailboxId={mailboxFilter}
        tags={filter.tags}
        startDate={filter.start}
        endDate={filter.end}
        onRemove={(filters) => setFilter(filters)}
      />

      <section className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="border">
            <div className="border-b px-3 py-2 text-sm font-medium">
              Messages
            </div>
            <div className="max-h-[520px] overflow-y-auto">
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
                        "w-full border-b px-3 py-3 text-left text-sm transition",
                        isActive ? "bg-muted" : "hover:bg-muted/60",
                      )}
                      onClick={() => setSelectedMessageId(msg.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                          {msg.subject ?? "(no subject)"}
                        </span>
                        {msg.tag ? (
                          <span className="bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                            {msg.tag}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {msg.from}
                      </div>
                      {showMailboxColumn ? (
                        <div className="text-xs text-muted-foreground">
                          {msg.mailboxWithTag}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        {formatReceivedAt(msg.receivedAt)}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="border">
            <div className="border-b px-3 py-2 text-sm font-medium">
              Preview
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
              <div className="space-y-3 p-3">
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
                  <div className="text-xs text-muted-foreground">
                    {formatReceivedAt(message.receivedAt)}
                  </div>
                </div>

                {htmlDocument ? (
                  <iframe
                    key={message.id}
                    title={message.subject ?? "Email preview"}
                    className="h-[520px] w-full border bg-white"
                    sandbox="allow-same-origin"
                    referrerPolicy="no-referrer"
                    srcDoc={htmlDocument}
                  />
                ) : (
                  <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap border bg-muted/30 p-3 text-xs">
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
