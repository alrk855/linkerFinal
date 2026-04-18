import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient();

    const role = request.nextUrl.searchParams.get("role");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectTo = `${appUrl}/api/auth/callback`;

    const options: Record<string, unknown> = {
      redirectTo,
      queryParams: {} as Record<string, string>,
    };

    if (role === "student" || role === "company") {
      (options.queryParams as Record<string, string>).state = Buffer.from(
        JSON.stringify({ role })
      ).toString("base64url");
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options,
    });

    if (error || !data.url) {
      const errorRedirect = new URL("/auth/signin", appUrl);
      errorRedirect.searchParams.set("error", "oauth_init_failed");
      return NextResponse.redirect(errorRedirect);
    }

    return NextResponse.redirect(data.url);
  });
}
