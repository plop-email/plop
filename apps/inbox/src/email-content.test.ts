import { describe, expect, it } from "bun:test";
import { parseEmailContent } from "./email-content";

function encode(text: string) {
  return new TextEncoder().encode(text);
}

describe("parseEmailContent", () => {
  it("parses plain text emails", () => {
    const raw =
      "Subject: Hello\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nHi there";
    const parsed = parseEmailContent(encode(raw));

    expect(parsed.plainContent).toBe("Hi there");
    expect(parsed.rawContent).toBe("Hi there");
    expect(parsed.headers.some((h) => h.name === "Subject")).toBe(true);
  });

  it("parses html emails", () => {
    const raw =
      "Subject: Hello\r\nContent-Type: text/html; charset=utf-8\r\n\r\n<strong>Hi</strong>";
    const parsed = parseEmailContent(encode(raw));

    expect(parsed.plainContent).toBeNull();
    expect(parsed.rawContent).toBe("<strong>Hi</strong>");
  });

  it("parses multipart emails with text and html", () => {
    const raw =
      "Subject: Multipart\r\n" +
      "Content-Type: multipart/alternative; boundary=abc123\r\n" +
      "\r\n" +
      "--abc123\r\n" +
      "Content-Type: text/plain; charset=utf-8\r\n\r\n" +
      "Plain body\r\n" +
      "--abc123\r\n" +
      "Content-Type: text/html; charset=utf-8\r\n\r\n" +
      "<p>HTML body</p>\r\n" +
      "--abc123--\r\n";

    const parsed = parseEmailContent(encode(raw));

    expect(parsed.plainContent).toBe("Plain body");
    expect(parsed.rawContent).toBe("<p>HTML body</p>");
  });

  it("decodes base64 text bodies", () => {
    const raw =
      "Subject: Base64\r\n" +
      "Content-Type: text/plain; charset=utf-8\r\n" +
      "Content-Transfer-Encoding: base64\r\n\r\n" +
      "SGVsbG8gd29ybGQh";

    const parsed = parseEmailContent(encode(raw));

    expect(parsed.plainContent).toBe("Hello world!");
  });
});
