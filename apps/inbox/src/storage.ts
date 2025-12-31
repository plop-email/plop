export type StoredMessage = {
  id: string;
  domain: string;
  mailbox: string;
  mailboxWithTag: string;
  tag: string | null;
  from: string;
  to: string;
  subject: string | null;
  receivedAt: string;
  rawSize: number;
  rawKey: string;
  status: MessageStatus;
  attempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
};

export type MessageStatus = "unprocessed" | "processed";

export function rawEmailKey(
  domain: string,
  mailboxKey: string,
  messageId: string,
): string {
  return `raw/${domain}/${mailboxKey}/${messageId}.eml`;
}

export function messageMetaKey(
  status: MessageStatus,
  domain: string,
  mailboxKey: string,
  messageId: string,
): string {
  return `messages/${status}/${domain}/${mailboxKey}/${messageId}.json`;
}

export async function storeInboundEmail(params: {
  bucket: R2Bucket;
  domain: string;
  mailboxLocalPart: string;
  mailboxKey: string;
  recipientLocalPart: string;
  recipientTag: string | null;
  messageId: string;
  message: ForwardableEmailMessage;
  raw?: ReadableStream<Uint8Array> | Uint8Array;
  receivedAt: string;
}): Promise<StoredMessage> {
  const {
    bucket,
    domain,
    mailboxLocalPart,
    mailboxKey,
    recipientLocalPart,
    recipientTag,
    messageId,
    message,
    raw,
    receivedAt,
  } = params;
  const subject = message.headers.get("subject");
  const status: MessageStatus = "unprocessed";
  const attempts = 0;
  const lastAttemptAt = null;
  const lastError = null;
  const rawKey = rawEmailKey(domain, mailboxKey, messageId);

  await bucket.put(rawKey, raw ?? message.raw, {
    httpMetadata: { contentType: "message/rfc822" },
    customMetadata: {
      domain,
      mailbox: mailboxLocalPart,
      mailboxWithTag: recipientLocalPart,
      tag: recipientTag ?? "",
      from: message.from,
      to: message.to,
      subject: subject ?? "",
      receivedAt,
      rawSize: String(message.rawSize),
    },
  });

  const metaKey = messageMetaKey(status, domain, mailboxKey, messageId);
  const metaBody = JSON.stringify(
    {
      id: messageId,
      status,
      domain,
      mailbox: mailboxLocalPart,
      mailboxWithTag: recipientLocalPart,
      tag: recipientTag,
      from: message.from,
      to: message.to,
      subject,
      receivedAt,
      rawSize: message.rawSize,
      rawKey,
      attempts,
      lastAttemptAt,
      lastError,
    },
    null,
    2,
  );
  await bucket.put(metaKey, metaBody, {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      status,
      domain,
      mailbox: mailboxLocalPart,
      mailboxWithTag: recipientLocalPart,
      tag: recipientTag ?? "",
      from: message.from,
      to: message.to,
      subject: subject ?? "",
      receivedAt,
      rawSize: String(message.rawSize),
      rawKey,
      attempts: String(attempts),
      lastAttemptAt: "",
      lastError: "",
    },
  });

  return {
    id: messageId,
    domain,
    mailbox: mailboxLocalPart,
    mailboxWithTag: recipientLocalPart,
    tag: recipientTag,
    from: message.from,
    to: message.to,
    subject,
    receivedAt,
    rawSize: message.rawSize,
    rawKey,
    status,
    attempts,
    lastAttemptAt,
    lastError,
  };
}

export async function listMailboxMessages(params: {
  bucket: R2Bucket;
  domain: string;
  mailboxKey: string;
  status: MessageStatus;
  limit: number;
  cursor?: string;
}): Promise<{ messages: StoredMessage[]; cursor?: string }> {
  const { bucket, domain, mailboxKey, status, limit, cursor } = params;

  const listed = await bucket.list({
    prefix: `messages/${status}/${domain}/${mailboxKey}/`,
    limit,
    cursor,
    include: ["customMetadata"],
  });

  const messages = listed.objects.map((obj) => {
    const id =
      obj.key
        .split("/")
        .at(-1)
        ?.replace(/\.json$/, "") ?? obj.key;
    const md = obj.customMetadata ?? {};
    const rawSize = parseNumber(md.rawSize) ?? 0;
    const mailbox =
      (md.mailbox as string | undefined) ?? decodeMailboxComponent(mailboxKey);
    const mailboxWithTag = (md.mailboxWithTag as string | undefined) ?? mailbox;
    const tag = ((md.tag as string | undefined) ?? "") || null;
    return {
      id,
      domain: (md.domain as string | undefined) ?? domain,
      mailbox,
      mailboxWithTag,
      tag,
      from: (md.from as string | undefined) ?? "",
      to: (md.to as string | undefined) ?? "",
      subject: ((md.subject as string | undefined) ?? "") || null,
      receivedAt:
        (md.receivedAt as string | undefined) ?? obj.uploaded.toISOString(),
      rawSize,
      rawKey: (md.rawKey as string | undefined) ?? "",
      status: parseStatus(md.status) ?? status,
      attempts: parseNumber(md.attempts) ?? 0,
      lastAttemptAt: ((md.lastAttemptAt as string | undefined) ?? "") || null,
      lastError: ((md.lastError as string | undefined) ?? "") || null,
    } satisfies StoredMessage;
  });

  return { messages, cursor: listed.truncated ? listed.cursor : undefined };
}

export async function headMessage(params: {
  bucket: R2Bucket;
  domain: string;
  mailboxKey: string;
  status: MessageStatus;
  id: string;
}): Promise<{ key: string; message: StoredMessage } | null> {
  const { bucket, domain, mailboxKey, status, id } = params;
  const key = messageMetaKey(status, domain, mailboxKey, id);
  const obj = await bucket.head(key);
  if (!obj) return null;

  const md = obj.customMetadata ?? {};
  const rawSize = parseNumber(md.rawSize) ?? 0;
  const mailbox =
    (md.mailbox as string | undefined) ?? decodeMailboxComponent(mailboxKey);
  const mailboxWithTag = (md.mailboxWithTag as string | undefined) ?? mailbox;
  const tag = ((md.tag as string | undefined) ?? "") || null;
  const message: StoredMessage = {
    id,
    domain: (md.domain as string | undefined) ?? domain,
    mailbox,
    mailboxWithTag,
    tag,
    from: (md.from as string | undefined) ?? "",
    to: (md.to as string | undefined) ?? "",
    subject: ((md.subject as string | undefined) ?? "") || null,
    receivedAt:
      (md.receivedAt as string | undefined) ?? obj.uploaded.toISOString(),
    rawSize,
    rawKey: (md.rawKey as string | undefined) ?? "",
    status: parseStatus(md.status) ?? status,
    attempts: parseNumber(md.attempts) ?? 0,
    lastAttemptAt: ((md.lastAttemptAt as string | undefined) ?? "") || null,
    lastError: ((md.lastError as string | undefined) ?? "") || null,
  };

  return { key, message };
}

export async function listMailboxes(params: {
  bucket: R2Bucket;
  domain: string;
  status: MessageStatus;
  limit: number;
  cursor?: string;
}): Promise<{ mailboxes: string[]; cursor?: string }> {
  const { bucket, domain, status, limit, cursor } = params;

  const listed = await bucket.list({
    prefix: `messages/${status}/${domain}/`,
    delimiter: "/",
    limit,
    cursor,
  });

  const mailboxes = listed.delimitedPrefixes
    .map((prefix) =>
      prefix.replace(`messages/${status}/${domain}/`, "").replace(/\/$/, ""),
    )
    .map((localPartKey) => decodeMailboxComponent(localPartKey))
    .filter((localPart) => localPart.length > 0)
    .map((localPart) => `${domain}/${localPart}`);

  return { mailboxes, cursor: listed.truncated ? listed.cursor : undefined };
}

export async function markMessageProcessed(params: {
  bucket: R2Bucket;
  domain: string;
  mailboxKey: string;
  id: string;
}): Promise<void> {
  const { bucket, domain, mailboxKey, id } = params;

  const processedKey = messageMetaKey("processed", domain, mailboxKey, id);
  const processedHead = await bucket.head(processedKey);
  if (processedHead) return;

  const unprocessedKey = messageMetaKey("unprocessed", domain, mailboxKey, id);
  const unprocessed = await bucket.get(unprocessedKey);
  if (!unprocessed) return;

  const text = await unprocessed.text();
  const parsed = safeJsonParse<Partial<StoredMessage>>(text) ?? {};
  const now = new Date().toISOString();

  const next: Partial<StoredMessage> = {
    ...parsed,
    id,
    status: "processed",
    lastAttemptAt: now,
    lastError: null,
  };

  await bucket.put(processedKey, JSON.stringify(next, null, 2), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      ...(unprocessed.customMetadata ?? {}),
      status: "processed",
      lastAttemptAt: now,
      lastError: "",
    },
  });

  await bucket.delete(unprocessedKey);
}

export async function recordWebhookAttempt(params: {
  bucket: R2Bucket;
  domain: string;
  mailboxKey: string;
  id: string;
  error: string | null;
}): Promise<void> {
  const { bucket, domain, mailboxKey, id, error } = params;

  const metaKey = messageMetaKey("unprocessed", domain, mailboxKey, id);
  const obj = await bucket.get(metaKey);
  if (!obj) return;

  const parsed = safeJsonParse<Partial<StoredMessage>>(await obj.text()) ?? {};
  const attempts =
    (typeof parsed.attempts === "number" ? parsed.attempts : 0) + 1;
  const lastAttemptAt = new Date().toISOString();
  const next: Partial<StoredMessage> = {
    ...parsed,
    id,
    attempts,
    lastAttemptAt,
    lastError: error,
  };

  await bucket.put(metaKey, JSON.stringify(next, null, 2), {
    httpMetadata: { contentType: "application/json" },
    customMetadata: {
      ...(obj.customMetadata ?? {}),
      attempts: String(attempts),
      lastAttemptAt,
      lastError: error ?? "",
    },
  });
}

function decodeMailboxComponent(component: string): string {
  try {
    return decodeURIComponent(component);
  } catch {
    return component;
  }
}

function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

function parseStatus(input: string | undefined): MessageStatus | null {
  if (!input) return null;
  if (input === "processed" || input === "unprocessed") return input;
  return null;
}

function parseNumber(input: string | undefined): number | null {
  if (!input) return null;
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}
