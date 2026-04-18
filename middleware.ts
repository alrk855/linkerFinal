import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/listings", "/company", "/admin", "/acknowledgments", "/notifications"];

// Internationalization definition
const locales = ['en', 'mk'];
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // or 'always'
});

function isProtectedRoute(pathname: string): boolean {
  // Strip locale from pathname for checks
  let path = pathname;
  for (const locale of locales) {
    if (path.startsWith(`/${locale}/`)) {
      path = path.slice(locale.length + 1);
    } else if (path === `/${locale}`) {
      path = "/";
    }
  }
  
  return PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function copyCookies(from: NextResponse, to: NextResponse): void {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie.name, cookie.value, cookie);
  }
}

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first to handle routing/locales
  const intlResponse = intlMiddleware(request);

  // 2. Wrap it inside Supabase updateSession
  // We need to merge everything correctly.
  const supabaseResponse = await updateSession(request);

  // We are creating a new response from intlResponse, and then we will apply supabase cookies to it.
  const finalResponse = intlResponse;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          for (const cookie of cookiesToSet) {
            finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = "guest";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle() as { data: { role: string } | null };

    role = profile?.role || "guest";
  }

  // Get path without locale for auth check
  let pathname = request.nextUrl.pathname;
  let currentLocale = defaultLocale;
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      currentLocale = locale;
      pathname = pathname.startsWith(`/${locale}/`) ? pathname.slice(locale.length + 1) : "/";
      break;
    }
  }

  if (isProtectedRoute(pathname) && !user) {
    // Redirect to locale-prefixed login
    const localePrefix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
    const redirectUrl = new URL(`${localePrefix}/auth/signin`, request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(finalResponse, redirectResponse);
    redirectResponse.headers.set("x-user-role", role);
    return redirectResponse;
  }

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && role !== "admin") {
    const localePrefix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
    const redirectResponse = NextResponse.redirect(new URL(`${localePrefix}/`, request.url));
    copyCookies(finalResponse, redirectResponse);
    redirectResponse.headers.set("x-user-role", role);
    return redirectResponse;
  }

  finalResponse.headers.set("x-user-role", role);
  return finalResponse;
}

export const config = {
  // Matcher ignoring `/_next/` and static files.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
