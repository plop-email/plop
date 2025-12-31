export type TrialPlanCookie = "starter" | "pro";

export const TRIAL_PLAN_COOKIE_NAME = "plop_trial_plan";

const TRIAL_PLAN_VALUES = new Set<TrialPlanCookie>(["starter", "pro"]);

export function parseTrialPlanCookie(
  value: string | null | undefined,
): TrialPlanCookie | null {
  if (!value) return null;
  return TRIAL_PLAN_VALUES.has(value as TrialPlanCookie)
    ? (value as TrialPlanCookie)
    : null;
}

export function getTrialPlanCookie(): TrialPlanCookie | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${TRIAL_PLAN_COOKIE_NAME}=`));

  if (!cookie) return null;

  const rawValue = cookie.split("=")[1];
  if (!rawValue) return null;

  return parseTrialPlanCookie(decodeURIComponent(rawValue));
}

export function setTrialPlanCookie(plan: TrialPlanCookie, maxAgeDays = 14) {
  if (typeof document === "undefined") return;

  const maxAgeSeconds = Math.max(1, Math.floor(maxAgeDays * 24 * 60 * 60));
  const expires = new Date(Date.now() + maxAgeSeconds * 1000);

  if (typeof window !== "undefined" && "cookieStore" in window) {
    void window.cookieStore.set({
      name: TRIAL_PLAN_COOKIE_NAME,
      value: plan,
      expires: expires.getTime(),
      path: "/",
      sameSite: "lax",
    });
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: fallback for browsers without Cookie Store API
  document.cookie = `${TRIAL_PLAN_COOKIE_NAME}=${encodeURIComponent(
    plan,
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearTrialPlanCookie() {
  if (typeof document === "undefined") return;

  if (typeof window !== "undefined" && "cookieStore" in window) {
    void window.cookieStore.delete(TRIAL_PLAN_COOKIE_NAME);
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: fallback for browsers without Cookie Store API
  document.cookie = `${TRIAL_PLAN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
