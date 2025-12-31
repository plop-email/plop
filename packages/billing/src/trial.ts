const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const TRIAL_DAYS = 14;

function toDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function getTrialEndsAt(createdAt: Date | string | null | undefined) {
  const createdDate = toDate(createdAt);
  if (!createdDate) return null;
  return new Date(createdDate.getTime() + TRIAL_DAYS * MS_PER_DAY);
}

export function getTrialDaysLeft(
  createdAt: Date | string | null | undefined,
  now = new Date(),
) {
  const endsAt = getTrialEndsAt(createdAt);
  if (!endsAt) return null;
  const remainingMs = endsAt.getTime() - now.getTime();
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / MS_PER_DAY);
}

export function isTrialExpired(createdAt: Date | string | null | undefined) {
  const daysLeft = getTrialDaysLeft(createdAt);
  return daysLeft !== null && daysLeft <= 0;
}
