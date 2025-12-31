import { type JWTPayload, jwtVerify } from "jose";
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

export async function verifyAccessToken(
  accessToken?: string,
): Promise<Session | null> {
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(
      accessToken,
      new TextEncoder().encode(env.SUPABASE_JWT_SECRET),
    );

    const supabasePayload = payload as SupabaseJWTPayload;

    return {
      user: {
        id: supabasePayload.sub!,
        email: supabasePayload.email ?? supabasePayload.user_metadata?.email,
        full_name: supabasePayload.user_metadata?.full_name,
      },
      jwt: supabasePayload,
    };
  } catch {
    return null;
  }
}
