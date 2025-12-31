export type PreferredAuthMethod = "password" | "google";

export const PREFERRED_AUTH_COOKIE_NAME = "plop_preferred_auth";

const PREFERRED_AUTH_VALUES = new Set<PreferredAuthMethod>([
  "password",
  "google",
]);

export function parsePreferredAuthCookie(
  value: string | null | undefined,
): PreferredAuthMethod | null {
  if (!value) return null;
  return PREFERRED_AUTH_VALUES.has(value as PreferredAuthMethod)
    ? (value as PreferredAuthMethod)
    : null;
}

export function getPreferredAuthCookie(): PreferredAuthMethod | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${PREFERRED_AUTH_COOKIE_NAME}=`));

  if (!cookie) return null;

  const rawValue = cookie.split("=")[1];
  if (!rawValue) return null;
  return parsePreferredAuthCookie(decodeURIComponent(rawValue));
}

export function setPreferredAuthCookie(
  method: PreferredAuthMethod,
  maxAgeDays = 365,
) {
  const maxAge = maxAgeDays * 24 * 60 * 60;

  if (typeof window !== "undefined" && "cookieStore" in window) {
    void window.cookieStore.set({
      name: PREFERRED_AUTH_COOKIE_NAME,
      value: method,
      expires: Date.now() + maxAge * 1000,
      path: "/",
      sameSite: "lax",
    });
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: fallback for browsers without Cookie Store API
  document.cookie = `${PREFERRED_AUTH_COOKIE_NAME}=${encodeURIComponent(
    method,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearPreferredAuthCookie() {
  if (typeof window !== "undefined" && "cookieStore" in window) {
    void window.cookieStore.delete(PREFERRED_AUTH_COOKIE_NAME);
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: fallback for browsers without Cookie Store API
  document.cookie = `${PREFERRED_AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}
