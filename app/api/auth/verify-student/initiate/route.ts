import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { verifyStudentInitiateSchema } from "@/lib/api/validate";

function encodeState(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireRole(request, "student");

    let payload: unknown = {};
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const parsed = verifyStudentInitiateSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body.", {
        issues: parsed.error.flatten(),
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectTo =
      parsed.data.redirect_to || `${appUrl}/api/auth/callback?provider=azure_ad`;

    const state = encodeState({
      userId: user.id,
      flow: "verify_student",
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          state,
        },
      },
    });

    if (error || !data.url) {
      throw new ApiError(
        500,
        "OAUTH_INIT_FAILED",
        "Failed to initiate Azure verification flow."
      );
    }

    return NextResponse.json({
      success: true,
      url: data.url,
    });
  });
}
