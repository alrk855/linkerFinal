import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/errors";
import { ADMIN_COOKIE_NAME } from "@/lib/api/admin-token";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();

    const response = NextResponse.json({
      success: true,
      redirectTo: "/",
    });

    const requestCookies = request.cookies.getAll();
    for (const cookie of requestCookies) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.delete(cookie.name);
      }
    }

    response.cookies.delete(ADMIN_COOKIE_NAME);

    return response;
  });
}
