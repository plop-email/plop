import { createClient } from "@plop/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  PREFERRED_AUTH_COOKIE_NAME,
  parsePreferredAuthCookie,
} from "@/utils/preferred-auth-cookie";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const provider = searchParams.get("provider");

  const preferred = parsePreferredAuthCookie(provider);
  if (preferred) {
    cookieStore.set(PREFERRED_AUTH_COOKIE_NAME, preferred, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}?error=auth-code-error`);
}
