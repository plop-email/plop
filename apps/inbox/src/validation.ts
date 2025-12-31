export type ParsedEmailAddress = {
  domain: string;
  localPart: string;
  localPartBase: string;
  localPartTag: string | null;
  localPartBaseKey: string;
};

const SAFE_LOCAL_PART = /^[a-z0-9](?:[a-z0-9._+-]{0,62}[a-z0-9])?$/;
const SAFE_LOCAL_PART_BASE = /^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/;

export function isValidMailboxLocalPart(input: string): boolean {
  return SAFE_LOCAL_PART_BASE.test(input);
}

export function isValidRecipientLocalPart(input: string): boolean {
  return SAFE_LOCAL_PART.test(input);
}

export function encodeMailboxComponent(input: string): string {
  return encodeURIComponent(input);
}

export function parseEmailAddress(input: string): ParsedEmailAddress | null {
  const value = input.trim().replace(/^<|>$/g, "");
  const at = value.lastIndexOf("@");
  if (at === -1) return null;

  const rawLocal = value.slice(0, at).trim();
  const rawDomain = value.slice(at + 1).trim();
  if (!rawLocal || !rawDomain) return null;

  const domain = rawDomain.toLowerCase();
  const localPart = rawLocal.toLowerCase();
  if (localPart.length > 64) return null;

  const plusIndex = localPart.indexOf("+");
  const localPartBase =
    plusIndex === -1 ? localPart : localPart.slice(0, plusIndex);
  const localPartTag = plusIndex === -1 ? null : localPart.slice(plusIndex + 1);

  if (!SAFE_LOCAL_PART.test(localPart)) return null;
  if (!SAFE_LOCAL_PART_BASE.test(localPartBase)) return null;

  return {
    domain,
    localPart,
    localPartBase,
    localPartTag,
    localPartBaseKey: encodeMailboxComponent(localPartBase),
  };
}
