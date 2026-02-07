import { db } from "@plop/db/client";
import { getLatestInboxMessage } from "@plop/db/queries";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { getTeamRetentionStart } from "../../utils/retention";
import type { ApiKeyContext } from "./auth";
import {
  hasEmailScope,
  parseDate,
  parseMailboxName,
  resolveMailboxScope,
} from "./utils";

const app = new Hono<{ Variables: { apiKey: ApiKeyContext } }>();

app.get("/stream", async (c) => {
  const apiKey = c.get("apiKey");

  if (!hasEmailScope(apiKey.scopes)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const mailboxParam = parseMailboxName(c.req.query("mailbox") ?? undefined);
  if (c.req.query("mailbox") && !mailboxParam) {
    return c.json({ error: "Invalid mailbox" }, 400);
  }

  let resolvedMailbox: string | null;
  try {
    resolvedMailbox = resolveMailboxScope(apiKey, mailboxParam);
  } catch {
    return c.json({ error: "Forbidden" }, 403);
  }

  const tag = c.req.query("tag")?.trim().toLowerCase() ?? null;
  const since = parseDate(c.req.query("since") ?? undefined);

  const retentionStart = await getTeamRetentionStart(db, apiKey.teamId);
  const effectiveSince =
    retentionStart && (!since || since < retentionStart)
      ? retentionStart
      : since;

  return streamSSE(c, async (stream) => {
    let lastSeenId: string | null = null;
    let sinceTime = effectiveSince ?? new Date();

    await stream.writeSSE({
      event: "connected",
      data: JSON.stringify({ timestamp: new Date().toISOString() }),
    });

    const abortSignal = c.req.raw.signal;
    let pingCounter = 0;

    while (!abortSignal.aborted) {
      const message = await getLatestInboxMessage(db, {
        teamId: apiKey.teamId,
        mailboxName: resolvedMailbox,
        tag,
        tags: [],
        q: null,
        to: null,
        from: null,
        subject: null,
        start: null,
        end: null,
        since: sinceTime,
      });

      if (message && message.id !== lastSeenId) {
        lastSeenId = message.id;
        sinceTime = new Date(message.receivedAt);
        await stream.writeSSE({
          event: "message.received",
          data: JSON.stringify({
            id: message.id,
            mailboxId: message.mailboxId,
            mailbox: message.mailbox,
            mailboxWithTag: message.mailboxWithTag,
            tag: message.tag,
            from: message.from,
            to: message.to,
            subject: message.subject,
            receivedAt: message.receivedAt,
          }),
          id: message.id,
        });
      }

      pingCounter++;
      if (pingCounter >= 7) {
        await stream.writeSSE({ event: "ping", data: "{}" });
        pingCounter = 0;
      }

      await stream.sleep(2000);
    }
  });
});

export { app as streamRouter };
