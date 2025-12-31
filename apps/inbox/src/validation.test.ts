import { describe, expect, it } from "bun:test";
import {
  encodeMailboxComponent,
  isValidMailboxLocalPart,
  isValidRecipientLocalPart,
  parseEmailAddress,
} from "./validation";

describe("validation", () => {
  it("parses email addresses with tags", () => {
    const parsed = parseEmailAddress("support+billing@company.in.plop.email");
    expect(parsed).not.toBeNull();
    expect(parsed?.domain).toBe("company.in.plop.email");
    expect(parsed?.localPart).toBe("support+billing");
    expect(parsed?.localPartBase).toBe("support");
    expect(parsed?.localPartTag).toBe("billing");
  });

  it("rejects invalid email addresses", () => {
    expect(parseEmailAddress("missing-at")).toBeNull();
    expect(parseEmailAddress("bad tag@domain.com")).toBeNull();
    expect(parseEmailAddress("bad!tag@domain.com")).toBeNull();
  });

  it("validates mailbox local parts without tags", () => {
    expect(isValidMailboxLocalPart("support")).toBe(true);
    expect(isValidMailboxLocalPart("support-team")).toBe(true);
    expect(isValidMailboxLocalPart("support+tag")).toBe(false);
  });

  it("validates recipient local parts with tags", () => {
    expect(isValidRecipientLocalPart("support")).toBe(true);
    expect(isValidRecipientLocalPart("support+billing")).toBe(true);
  });

  it("encodes mailbox components", () => {
    expect(encodeMailboxComponent("support.team")).toBe("support.team");
    expect(encodeMailboxComponent("support team")).toBe("support%20team");
  });
});
