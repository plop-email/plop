export type HeaderEntry = { name: string; value: string };

export type ParsedEmailContent = {
  headers: HeaderEntry[];
  rawContent: string | null;
  plainContent: string | null;
};

export async function streamToUint8Array(
  stream: ReadableStream<Uint8Array>,
): Promise<Uint8Array> {
  const ab = await new Response(stream).arrayBuffer();
  return new Uint8Array(ab);
}

export function parseEmailContent(raw: Uint8Array): ParsedEmailContent {
  const rawText = decodeBestEffort(raw);
  const split = splitHeadersAndBody(rawText);
  const headers = parseHeaders(split.headersText);
  const headerMap = headersToMap(headers);

  const extracted = extractTextBodies({
    headers: headerMap,
    body: split.bodyText,
    depth: 0,
  });

  const plainContent = extracted.plainContent
    ? normalizeBody(extracted.plainContent)
    : null;
  const htmlContent = extracted.htmlContent
    ? normalizeBody(extracted.htmlContent)
    : null;

  return {
    headers,
    rawContent: htmlContent ?? plainContent,
    plainContent,
  };
}

type HeaderMap = Map<string, string[]>;

function decodeBestEffort(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false, ignoreBOM: true }).decode(
    bytes,
  );
}

function splitHeadersAndBody(input: string): {
  headersText: string;
  bodyText: string;
} {
  const crlfSep = "\r\n\r\n";
  const lfSep = "\n\n";

  const crlfIndex = input.indexOf(crlfSep);
  if (crlfIndex !== -1) {
    return {
      headersText: input.slice(0, crlfIndex),
      bodyText: input.slice(crlfIndex + crlfSep.length),
    };
  }

  const lfIndex = input.indexOf(lfSep);
  if (lfIndex !== -1) {
    return {
      headersText: input.slice(0, lfIndex),
      bodyText: input.slice(lfIndex + lfSep.length),
    };
  }

  return { headersText: input, bodyText: "" };
}

function parseHeaders(input: string): HeaderEntry[] {
  const normalized = input.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const headers: HeaderEntry[] = [];

  let currentName: string | null = null;
  let currentValue = "";

  const flush = () => {
    if (!currentName) return;
    headers.push({ name: currentName, value: currentValue.trim() });
    currentName = null;
    currentValue = "";
  };

  for (const line of lines) {
    if (!line) continue;

    if (/^[ \t]/.test(line)) {
      if (currentName) currentValue += ` ${line.trim()}`;
      continue;
    }

    flush();

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    currentName = line.slice(0, idx).trim();
    currentValue = line.slice(idx + 1).trim();
  }

  flush();
  return headers;
}

function headersToMap(headers: HeaderEntry[]): HeaderMap {
  const map = new Map<string, string[]>();
  for (const header of headers) {
    const key = header.name.toLowerCase();
    const list = map.get(key) ?? [];
    list.push(header.value);
    map.set(key, list);
  }
  return map;
}

function firstHeader(map: HeaderMap, name: string): string | null {
  const values = map.get(name.toLowerCase());
  if (!values?.length) return null;
  return values[0] ?? null;
}

function getParam(headerValue: string, paramName: string): string | null {
  const re = new RegExp(`${paramName}\\s*=\\s*(?:"([^"]+)"|([^;\\s]+))`, "i");
  const match = re.exec(headerValue);
  const value = (match?.[1] ?? match?.[2])?.trim();
  return value ? value.replace(/^"|"$/g, "") : null;
}

function normalizeCharset(input: string | null): string {
  const value = (input ?? "utf-8").trim().toLowerCase();
  return value.replace(/^"|"$/g, "");
}

function decodeBytes(bytes: Uint8Array, charset: string): string {
  const normalized = normalizeCharset(charset);
  try {
    return new TextDecoder(normalized, {
      fatal: false,
      ignoreBOM: true,
    }).decode(bytes);
  } catch {
    return new TextDecoder("utf-8", { fatal: false, ignoreBOM: true }).decode(
      bytes,
    );
  }
}

function decodeBase64(input: string): Uint8Array {
  const cleaned = input.replace(/\s+/g, "");
  try {
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return new Uint8Array();
  }
}

function decodeQuotedPrintable(input: string): Uint8Array {
  const normalized = input.replace(/=\r?\n/g, "");
  const bytes: number[] = [];

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === "=" && i + 2 < normalized.length) {
      const hex = normalized.slice(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(Number.parseInt(hex, 16));
        i += 2;
        continue;
      }
    }

    bytes.push(normalized.charCodeAt(i) & 0xff);
  }

  return new Uint8Array(bytes);
}

function normalizeBody(input: string): string {
  return input.replace(/\r\n/g, "\n").trim();
}

function splitMultipartBody(body: string, boundary: string): string[] {
  const normalized = `\n${body.replace(/\r\n/g, "\n")}`;
  const marker = `\n--${boundary}`;
  const chunks = normalized.split(marker);
  if (chunks.length <= 1) return [];

  const parts: string[] = [];
  for (let i = 1; i < chunks.length; i++) {
    let chunk = chunks[i] ?? "";
    if (chunk.startsWith("--")) break; // closing boundary

    if (chunk.startsWith("\n")) chunk = chunk.slice(1);
    parts.push(chunk);
  }

  return parts;
}

function decodeTextBody(params: {
  body: string;
  contentTransferEncoding: string | null;
  charset: string | null;
}): string {
  const encoding = (params.contentTransferEncoding ?? "7bit")
    .trim()
    .toLowerCase();
  const charset = normalizeCharset(params.charset);

  if (encoding === "base64") {
    return decodeBytes(decodeBase64(params.body), charset);
  }

  if (encoding === "quoted-printable") {
    return decodeBytes(decodeQuotedPrintable(params.body), charset);
  }

  // 7bit / 8bit / binary (best-effort)
  return params.body;
}

function isAttachment(headers: HeaderMap): boolean {
  const disposition = firstHeader(headers, "content-disposition");
  if (!disposition) return false;
  return disposition.toLowerCase().includes("attachment");
}

function extractTextBodies(params: {
  headers: HeaderMap;
  body: string;
  depth: number;
}): { plainContent: string | null; htmlContent: string | null } {
  if (params.depth > 10) return { plainContent: null, htmlContent: null };

  const contentTypeRaw =
    firstHeader(params.headers, "content-type") ?? "text/plain";
  const contentType =
    contentTypeRaw.split(";")[0]?.trim().toLowerCase() ?? "text/plain";

  if (contentType.startsWith("multipart/")) {
    const boundary = getParam(contentTypeRaw, "boundary");
    if (!boundary) return { plainContent: null, htmlContent: null };

    const parts = splitMultipartBody(params.body, boundary);
    let plainContent: string | null = null;
    let htmlContent: string | null = null;

    for (const part of parts) {
      const split = splitHeadersAndBody(part);
      const partHeaders = headersToMap(parseHeaders(split.headersText));
      const extracted = extractTextBodies({
        headers: partHeaders,
        body: split.bodyText,
        depth: params.depth + 1,
      });

      if (!plainContent && extracted.plainContent)
        plainContent = extracted.plainContent;
      if (!htmlContent && extracted.htmlContent)
        htmlContent = extracted.htmlContent;
      if (plainContent && htmlContent) break;
    }

    return { plainContent, htmlContent };
  }

  if (
    contentType.startsWith("text/plain") ||
    contentType.startsWith("text/html")
  ) {
    if (isAttachment(params.headers))
      return { plainContent: null, htmlContent: null };

    const charset = getParam(contentTypeRaw, "charset");
    const cte = firstHeader(params.headers, "content-transfer-encoding");
    const decoded = decodeTextBody({
      body: params.body,
      contentTransferEncoding: cte,
      charset,
    });

    if (contentType.startsWith("text/plain")) {
      return { plainContent: decoded, htmlContent: null };
    }

    return { plainContent: null, htmlContent: decoded };
  }

  return { plainContent: null, htmlContent: null };
}
