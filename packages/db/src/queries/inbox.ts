import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import type { Database } from "../client";
import { inboxMailboxes, inboxMessages } from "../schema";

export type InboxMessageFilters = {
  teamId: string;
  mailboxName: string | null;
  tag: string | null;
  tags: string[];
  q: string | null;
  to: string | null;
  from: string | null;
  subject: string | null;
  start: Date | null;
  end: Date | null;
  since: Date | null;
  limit: number;
};

function buildMessageConditions(params: Omit<InboxMessageFilters, "limit">) {
  const conditions: SQL<unknown>[] = [eq(inboxMessages.teamId, params.teamId)];

  if (params.mailboxName) {
    conditions.push(eq(inboxMessages.mailbox, params.mailboxName));
  }

  if (params.tag) {
    conditions.push(eq(inboxMessages.tag, params.tag));
  }

  if (params.tags.length > 0) {
    conditions.push(inArray(inboxMessages.tag, params.tags));
  }

  const normalizedQuery = params.q?.trim();
  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    const searchCondition = or(
      ilike(inboxMessages.subject, pattern),
      ilike(inboxMessages.fromAddress, pattern),
      ilike(inboxMessages.toAddress, pattern),
      ilike(inboxMessages.mailboxWithTag, pattern),
      ilike(inboxMessages.mailbox, pattern),
      ilike(inboxMessages.tag, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (params.to) {
    conditions.push(ilike(inboxMessages.toAddress, `%${params.to}%`));
  }
  if (params.from) {
    conditions.push(ilike(inboxMessages.fromAddress, `%${params.from}%`));
  }
  if (params.subject) {
    conditions.push(ilike(inboxMessages.subject, `%${params.subject}%`));
  }

  if (params.since) {
    conditions.push(gte(inboxMessages.receivedAt, params.since));
  }
  if (params.start) {
    conditions.push(gte(inboxMessages.receivedAt, params.start));
  }
  if (params.end) {
    conditions.push(lte(inboxMessages.receivedAt, params.end));
  }

  return conditions;
}

export async function listInboxMailboxes(
  db: Database,
  params: { teamId: string; mailboxName: string | null },
) {
  const conditions: SQL<unknown>[] = [eq(inboxMailboxes.teamId, params.teamId)];
  if (params.mailboxName) {
    conditions.push(eq(inboxMailboxes.name, params.mailboxName));
  }

  return db
    .select({
      id: inboxMailboxes.id,
      name: inboxMailboxes.name,
      domain: inboxMailboxes.domain,
      createdAt: inboxMailboxes.createdAt,
      updatedAt: inboxMailboxes.updatedAt,
    })
    .from(inboxMailboxes)
    .where(and(...conditions))
    .orderBy(desc(inboxMailboxes.updatedAt), inboxMailboxes.name);
}

export async function listInboxMessages(
  db: Database,
  filters: InboxMessageFilters,
) {
  const { limit: _limit, ...rest } = filters;
  const conditions = buildMessageConditions(rest);

  return db
    .select({
      id: inboxMessages.id,
      mailboxId: inboxMessages.mailboxId,
      mailbox: inboxMessages.mailbox,
      mailboxWithTag: inboxMessages.mailboxWithTag,
      tag: inboxMessages.tag,
      from: inboxMessages.fromAddress,
      to: inboxMessages.toAddress,
      subject: inboxMessages.subject,
      receivedAt: inboxMessages.receivedAt,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .orderBy(desc(inboxMessages.receivedAt))
    .limit(filters.limit);
}

export async function getLatestInboxMessage(
  db: Database,
  filters: Omit<InboxMessageFilters, "limit">,
) {
  const conditions = buildMessageConditions(filters);

  const [message] = await db
    .select({
      id: inboxMessages.id,
      mailboxId: inboxMessages.mailboxId,
      mailbox: inboxMessages.mailbox,
      mailboxWithTag: inboxMessages.mailboxWithTag,
      tag: inboxMessages.tag,
      from: inboxMessages.fromAddress,
      to: inboxMessages.toAddress,
      subject: inboxMessages.subject,
      receivedAt: inboxMessages.receivedAt,
      headers: inboxMessages.headers,
      htmlContent: inboxMessages.htmlContent,
      textContent: inboxMessages.textContent,
      domain: inboxMessages.domain,
      tenantSubdomain: inboxMessages.tenantSubdomain,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .orderBy(desc(inboxMessages.receivedAt))
    .limit(1);

  return message ?? null;
}

export async function getInboxMessageById(
  db: Database,
  params: { teamId: string; id: string; mailboxName: string | null },
) {
  const conditions: SQL<unknown>[] = [
    eq(inboxMessages.teamId, params.teamId),
    eq(inboxMessages.id, params.id),
  ];

  if (params.mailboxName) {
    conditions.push(eq(inboxMessages.mailbox, params.mailboxName));
  }

  const [message] = await db
    .select({
      id: inboxMessages.id,
      mailboxId: inboxMessages.mailboxId,
      mailbox: inboxMessages.mailbox,
      mailboxWithTag: inboxMessages.mailboxWithTag,
      tag: inboxMessages.tag,
      from: inboxMessages.fromAddress,
      to: inboxMessages.toAddress,
      subject: inboxMessages.subject,
      receivedAt: inboxMessages.receivedAt,
      headers: inboxMessages.headers,
      htmlContent: inboxMessages.htmlContent,
      textContent: inboxMessages.textContent,
      domain: inboxMessages.domain,
      tenantSubdomain: inboxMessages.tenantSubdomain,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .limit(1);

  return message ?? null;
}
