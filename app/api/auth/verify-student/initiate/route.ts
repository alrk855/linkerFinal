import { NextRequest, NextResponse } from "next/server";
import { createRedirectClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

function encodeState(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

// GET: browser navigates here directly — redirect to Azure OAuth
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user } = await requireRole(request, "student");

    const appOrigin = request.nextUrl.origin;
    const callbackUrl = new URL("/api/auth/callback", appOrigin);
    callbackUrl.searchParams.set("provider", "azure_ad");

    const state = encodeState({
      userId: user.id,
      flow: "verify_student",
    });

    const { supabase, finish } = createRedirectClient(request);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: callbackUrl.toString(),
        skipBrowserRedirect: true,
        queryParams: { state },
      },
    });

    if (error || !data.url) {
      throw new ApiError(500, "OAUTH_INIT_FAILED", "Failed to initiate Azure verification flow.");
    }

    return finish(NextResponse.redirect(data.url));
  });
}

// POST: API call — return the URL as JSON
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireRole(request, "student");

    const appOrigin = request.nextUrl.origin;
    const callbackUrl = new URL("/api/auth/callback", appOrigin);
    callbackUrl.searchParams.set("provider", "azure_ad");

    const state = encodeState({
      userId: user.id,
      flow: "verify_student",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: callbackUrl.toString(),
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
