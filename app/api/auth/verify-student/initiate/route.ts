import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { requireRole } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

function encodeState(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

// GET: browser navigates here directly — redirect to Azure OAuth
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Verify the user is an authenticated student
    const { user } = await requireRole(request, "student");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectTo = `${appUrl}/api/auth/callback?provider=azure_ad`;

    const state = encodeState({
      userId: user.id,
      flow: "verify_student",
    });

    // Create a fresh supabase client that captures cookies on a mutable array
    // so we can forward PKCE cookies onto the redirect response
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

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { state },
      },
    });

    if (error || !data.url) {
      throw new ApiError(500, "OAUTH_INIT_FAILED", "Failed to initiate Azure verification flow.");
    }

    const response = NextResponse.redirect(data.url);
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    return response;
  });
}

// POST: API call — return the URL as JSON
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireRole(request, "student");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectTo = `${appUrl}/api/auth/callback?provider=azure_ad`;

    const state = encodeState({
      userId: user.id,
      flow: "verify_student",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { state },
      },
    });

    if (error || !data.url) {
      throw new ApiError(500, "OAUTH_INIT_FAILED", "Failed to initiate Azure verification flow.");
    }

    return NextResponse.json({ success: true, url: data.url });
  });
}
