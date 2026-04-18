import { NextRequest, NextResponse } from "next/server";
import { createRedirectClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const GOOGLE_ROLE_COOKIE = "linker_oauth_role";

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  const appOrigin = request.nextUrl.origin;
  const callbackUrl = new URL("/api/auth/callback", appOrigin);

  const { supabase, finish } = createRedirectClient(request);

  const oauthOptions: Record<string, unknown> = { redirectTo: callbackUrl.toString() };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: oauthOptions,
  });

  if (error || !data.url) {
    console.error("Google OAuth init failed:", error?.message);
    return NextResponse.redirect(new URL("/auth/signin?error=oauth_init_failed", appOrigin));
  }

  const response = NextResponse.redirect(data.url);

  if (role === "student" || role === "company") {
    response.cookies.set(GOOGLE_ROLE_COOKIE, role, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 10 * 60,
    });
  } else {
    response.cookies.delete(GOOGLE_ROLE_COOKIE);
  }

  return finish(response);
}
