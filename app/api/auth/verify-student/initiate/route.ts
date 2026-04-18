import { NextRequest, NextResponse } from "next/server";
import { createRedirectClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

const VERIFY_USER_COOKIE = "linker_verify_user_id";

// GET: browser navigates here directly — redirect to Azure OAuth
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user } = await requireRole(request, "student");

    const appOrigin = request.nextUrl.origin;
    const callbackUrl = new URL("/api/auth/callback", appOrigin);
    callbackUrl.searchParams.set("provider", "azure_ad");

    const { supabase, finish } = createRedirectClient(request);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      throw new ApiError(500, "OAUTH_INIT_FAILED", "Failed to initiate Azure verification flow.");
    }

    const response = NextResponse.redirect(data.url);
    response.cookies.set(VERIFY_USER_COOKIE, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 10 * 60,
    });

    return finish(response);
  });
}

// POST: API call — return the URL as JSON
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase } = await requireRole(request, "student");

    const appOrigin = request.nextUrl.origin;
    const callbackUrl = new URL("/api/auth/callback", appOrigin);
    callbackUrl.searchParams.set("provider", "azure_ad");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      throw new ApiError(500, "OAUTH_INIT_FAILED", "Failed to initiate Azure verification flow.");
    }

    return NextResponse.json({ success: true, url: data.url });
  });
}
