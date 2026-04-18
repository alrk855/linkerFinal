import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const role = request.nextUrl.searchParams.get("role");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectTo = `${appUrl}/api/auth/callback`;

    // Collect cookies that Supabase sets during signInWithOAuth (PKCE code verifier)
    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies.push(...cookiesToSet);
          },
        },
      }
    );

    const oauthOptions: Record<string, unknown> = {
      redirectTo,
    };

    if (role === "student" || role === "company") {
      oauthOptions.queryParams = {
        state: Buffer.from(JSON.stringify({ role })).toString("base64url"),
      };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: oauthOptions,
    });

    if (error || !data.url) {
      const errorRedirect = new URL("/auth/signin", appUrl);
      errorRedirect.searchParams.set("error", "oauth_init_failed");
      return NextResponse.redirect(errorRedirect);
    }

    // Redirect to Google and attach the PKCE cookies
    const response = NextResponse.redirect(data.url);
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    return response;
  });
}
