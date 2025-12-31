import { createHash, randomBytes } from "node:crypto";

export const API_KEY_PREFIX = "plop_";
const KEY_BYTES = 32;

export function generateApiKey(): string {
  const randomString = randomBytes(KEY_BYTES).toString("hex");
  return `${API_KEY_PREFIX}${randomString}`;
}

export function isValidApiKeyFormat(key: string): boolean {
  return (
    key.startsWith(API_KEY_PREFIX) &&
    key.length === API_KEY_PREFIX.length + KEY_BYTES * 2
  );
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
