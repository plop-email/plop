import { updateSession } from "@plop/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

const PUBLIC_ROUTES = [
  "/login",
  "/sign-up",
  "/sign-up-success",
  "/forgot-password",
  "/update-password",
  "/auth/error",
  "/auth/confirm",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname.endsWith(route) || pathname.includes("/api/auth/"),
  );
}

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(
    request,
    I18nMiddleware(request),
  );

  if (!isPublicRoute(request.nextUrl.pathname) && !claims) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
