import { describe, expect, it } from "bun:test";
import { messageMetaKey, rawEmailKey } from "./storage";

describe("storage keys", () => {
  it("builds raw email keys", () => {
    const key = rawEmailKey("in.plop.email", "support", "abc-123");
    expect(key).toBe("raw/in.plop.email/support/abc-123.eml");
  });

  it("builds metadata keys", () => {
    const key = messageMetaKey(
      "processed",
      "in.plop.email",
      "support",
      "abc-123",
    );
    expect(key).toBe("messages/processed/in.plop.email/support/abc-123.json");
  });
});
