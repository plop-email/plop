import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";
import { env } from "../env";

export type Session = {
  user: {
    id: string;
    email?: string | null;
    full_name?: string | null;
  };
  jwt?: SupabaseJWTPayload;
};

type SupabaseJWTPayload = JWTPayload & {
  role?: string;
  email?: string;
  session_id?: string;
  user_metadata?: {
    email?: string;
    full_name?: string;
    [key: string]: string | undefined;
  };
};

// Cached JWKS fetcher (jose caches internally, but we keep a single instance)
const jwksUrl = new URL(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
);
const JWKS = createRemoteJWKSet(jwksUrl);

// Expected issuer and audience for Supabase Auth JWTs
const expectedIssuer = `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`;
const expectedAudience = "authenticated";

// HS256 secret for fallback
const hs256Secret = env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(env.SUPABASE_JWT_SECRET)
  : undefined;

export async function verifyAccessToken(
  accessToken?: string,
): Promise<Session | null> {
  if (!accessToken) return null;

  // Try JWKS (ES256/RS256) first
  let payload: JWTPayload | undefined;
  try {
    const result = await jwtVerify(accessToken, JWKS, {
      issuer: expectedIssuer,
      audience: expectedAudience,
    });
    payload = result.payload;
  } catch {
    // JWKS verification failed; fall back to HS256 if secret is configured
    if (hs256Secret) {
      try {
        const result = await jwtVerify(accessToken, hs256Secret, {
          issuer: expectedIssuer,
          audience: expectedAudience,
        });
        payload = result.payload;
      } catch {
        // HS256 also failed
        return null;
      }
    } else {
      return null;
    }
  }

  const supabasePayload = payload as SupabaseJWTPayload;

  return {
    user: {
      id: supabasePayload.sub!,
      email: supabasePayload.email ?? supabasePayload.user_metadata?.email,
      full_name: supabasePayload.user_metadata?.full_name,
    },
    jwt: supabasePayload,
  };
}
