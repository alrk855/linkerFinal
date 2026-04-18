import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { verifyStudentInitiateSchema } from "@/lib/api/validate";
export const dynamic = "force-dynamic";

function encodeState(payload: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

async function initiateAzureFlow(request: NextRequest) {
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

  return { url: data.url, appUrl };
}

// GET: browser navigates here directly — redirect to Azure OAuth
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { url, appUrl } = await initiateAzureFlow(request);
    return NextResponse.redirect(url);
  });
}

// POST: API call — return the URL as JSON
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { url } = await initiateAzureFlow(request);
    return NextResponse.json({ success: true, url });
  });
}
