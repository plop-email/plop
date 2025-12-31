export const assertServerOnly = () => {
  const hasWindow =
    typeof globalThis !== "undefined" &&
    "window" in globalThis &&
    Boolean((globalThis as { window?: unknown }).window);

  if (hasWindow) {
    throw new Error(
      "@plop/kv is server-only. Do not import it from Client Components.",
    );
  }
};
