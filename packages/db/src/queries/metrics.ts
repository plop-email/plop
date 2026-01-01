import type { SQL } from "drizzle-orm";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Database } from "../client";
import { inboxMessages } from "../schema";

type MetricsParams = {
  teamId: string;
  start: Date;
  end: Date;
  mailboxId?: string;
};

export type InboxMetricsOverview = {
  totals: {
    inbound: number;
    uniqueSenders: number;
    tagged: number;
    mailboxes: number;
  };
  volumeByDay: Array<{ date: string; count: number }>;
  volumeByHour: Array<{ hour: number; count: number }>;
  mailboxes: Array<{ mailbox: string; count: number }>;
  tags: Array<{ tag: string; count: number }>;
  topSenders: Array<{ sender: string; count: number }>;
};

function buildConditions(params: MetricsParams) {
  const conditions: SQL<unknown>[] = [
    eq(inboxMessages.teamId, params.teamId),
    gte(inboxMessages.receivedAt, params.start),
    lte(inboxMessages.receivedAt, params.end),
  ];

  if (params.mailboxId) {
    conditions.push(eq(inboxMessages.mailboxId, params.mailboxId));
  }

  return conditions;
}

function normalizeCount(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  return 0;
}

export async function getInboxMetricsOverview(
  db: Database,
  params: MetricsParams,
): Promise<InboxMetricsOverview> {
  const conditions = buildConditions(params);

  const [totalsRow] = await db
    .select({
      inbound: sql<number>`count(*)`,
      uniqueSenders: sql<number>`count(distinct ${inboxMessages.fromAddress})`,
      tagged: sql<number>`count(*) filter (where ${inboxMessages.tag} is not null)`,
      mailboxes: sql<number>`count(distinct ${inboxMessages.mailboxId})`,
    })
    .from(inboxMessages)
    .where(and(...conditions));

  const dayBucket = sql<string>`to_char(date_trunc('day', ${inboxMessages.receivedAt} at time zone 'UTC'), 'YYYY-MM-DD')`;
  const volumeByDayRows = await db
    .select({
      date: dayBucket,
      count: sql<number>`count(*)::int`,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .groupBy(dayBucket)
    .orderBy(dayBucket);

  const hourBucket = sql<number>`extract(hour from ${inboxMessages.receivedAt} at time zone 'UTC')`;
  const volumeByHourRows = await db
    .select({
      hour: hourBucket,
      count: sql<number>`count(*)::int`,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .groupBy(hourBucket)
    .orderBy(hourBucket);

  const mailboxCount = sql<number>`count(*)::int`;
  const mailboxes = await db
    .select({
      mailbox: inboxMessages.mailbox,
      count: mailboxCount,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .groupBy(inboxMessages.mailbox)
    .orderBy(desc(mailboxCount))
    .limit(6);

  const tagKey = sql<string>`coalesce(${inboxMessages.tag}, 'Untagged')`;
  const tagCount = sql<number>`count(*)::int`;
  const tags = await db
    .select({
      tag: tagKey,
      count: tagCount,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .groupBy(tagKey)
    .orderBy(desc(tagCount))
    .limit(6);

  const senderCount = sql<number>`count(*)::int`;
  const topSenders = await db
    .select({
      sender: inboxMessages.fromAddress,
      count: senderCount,
    })
    .from(inboxMessages)
    .where(and(...conditions))
    .groupBy(inboxMessages.fromAddress)
    .orderBy(desc(senderCount))
    .limit(6);

  return {
    totals: {
      inbound: normalizeCount(totalsRow?.inbound ?? 0),
      uniqueSenders: normalizeCount(totalsRow?.uniqueSenders ?? 0),
      tagged: normalizeCount(totalsRow?.tagged ?? 0),
      mailboxes: normalizeCount(totalsRow?.mailboxes ?? 0),
    },
    volumeByDay: volumeByDayRows.map((row) => ({
      date: row.date,
      count: normalizeCount(row.count),
    })),
    volumeByHour: volumeByHourRows.map((row) => ({
      hour: Number(row.hour),
      count: normalizeCount(row.count),
    })),
    mailboxes: mailboxes.map((row) => ({
      mailbox: row.mailbox,
      count: normalizeCount(row.count),
    })),
    tags: tags.map((row) => ({
      tag: row.tag,
      count: normalizeCount(row.count),
    })),
    topSenders: topSenders.map((row) => ({
      sender: row.sender,
      count: normalizeCount(row.count),
    })),
  };
}
