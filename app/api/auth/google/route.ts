import { NextRequest, NextResponse } from "next/server";
import { createRedirectClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  const appOrigin = request.nextUrl.origin;
  const callbackUrl = new URL("/api/auth/callback", appOrigin);

  const { supabase, finish } = createRedirectClient(request);

  const oauthOptions: Record<string, unknown> = { redirectTo: callbackUrl.toString() };

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
    console.error("Google OAuth init failed:", error?.message);
    return NextResponse.redirect(new URL("/auth/signin?error=oauth_init_failed", appOrigin));
  }

  return finish(NextResponse.redirect(data.url));
}
