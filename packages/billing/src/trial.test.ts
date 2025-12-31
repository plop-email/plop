import { describe, expect, it } from "bun:test";
import {
  getTrialDaysLeft,
  getTrialEndsAt,
  isTrialExpired,
  TRIAL_DAYS,
} from "./trial";

describe("trial helpers", () => {
  it("calculates trial end date from creation date", () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const endsAt = getTrialEndsAt(createdAt);
    expect(endsAt?.toISOString()).toBe("2025-01-15T00:00:00.000Z");
  });

  it("returns full trial days on day 0", () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const now = new Date("2025-01-01T00:00:00.000Z");
    const daysLeft = getTrialDaysLeft(createdAt, now);
    expect(daysLeft).toBe(TRIAL_DAYS);
  });

  it("counts down to zero at expiry", () => {
    const createdAt = new Date("2025-01-01T00:00:00.000Z");
    const dayBeforeEnd = new Date("2025-01-14T00:00:00.000Z");
    const endDay = new Date("2025-01-15T00:00:00.000Z");
    const dayAfterEnd = new Date("2025-01-16T00:00:00.000Z");

    expect(getTrialDaysLeft(createdAt, dayBeforeEnd)).toBe(1);
    expect(getTrialDaysLeft(createdAt, endDay)).toBe(0);
    expect(getTrialDaysLeft(createdAt, dayAfterEnd)).toBe(0);
  });

  it("detects expired trials", () => {
    const now = new Date();
    const createdAt = new Date(now);
    const expiredAt = new Date(
      now.getTime() - (TRIAL_DAYS + 1) * 24 * 60 * 60 * 1000,
    );
    expect(isTrialExpired(createdAt)).toBe(false);
    expect(isTrialExpired(expiredAt)).toBe(true);
  });
});
