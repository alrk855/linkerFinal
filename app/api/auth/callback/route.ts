import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { getProfileById } from "@/lib/supabase/queries";
export const dynamic = "force-dynamic";

type OAuthState = {
  userId?: string;
  role?: "student" | "company";
  flow?: string;
};

function parseOAuthState(rawState: string | null): OAuthState {
  if (!rawState) {
    return {};
  }

  const candidates = [rawState];

  try {
    candidates.push(decodeURIComponent(rawState));
  } catch {}

  try {
    candidates.push(Buffer.from(rawState, "base64url").toString("utf-8"));
  } catch {}

  try {
    candidates.push(Buffer.from(rawState, "base64").toString("utf-8"));
  } catch {}

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        return parsed as OAuthState;
      }
    } catch {}
  }

  return {};
}

function getBaseUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

function isUkimEmail(email: string): boolean {
  const normalized = email.toLowerCase();
  return (
    normalized.endsWith("@ukim.edu.mk") ||
    normalized.endsWith(".ukim.edu.mk") ||
    normalized.includes("@") && normalized.split("@")[1]?.endsWith(".ukim.edu.mk")
  );
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const baseUrl = getBaseUrl(request);
    const url = request.nextUrl;
    const code = url.searchParams.get("code");

    if (!code) {
      throw new ApiError(400, "VALIDATION_ERROR", "Missing OAuth code.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      const redirectUrl = new URL("/auth/signin", baseUrl);
      redirectUrl.searchParams.set("error", "oauth_exchange_failed");
      return NextResponse.redirect(redirectUrl);
    }

    const queryProvider = url.searchParams.get("provider");
    const sessionProvider =
      data.session?.user.app_metadata.provider || data.user.app_metadata.provider;
    const provider = (queryProvider || sessionProvider || "").toLowerCase();
    const state = parseOAuthState(url.searchParams.get("state"));

    if (provider === "azure_ad" || provider === "azure") {
      const azureEmail = data.user.email;
      const targetUserId = state.userId;

      if (!targetUserId) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "Missing verification state for Azure verification flow."
        );
      }

      if (!azureEmail || !isUkimEmail(azureEmail)) {
        const invalidEmailRedirect = new URL("/auth/verify-student", baseUrl);
        invalidEmailRedirect.searchParams.set("error", "invalid_ukim_email");
        return NextResponse.redirect(invalidEmailRedirect);
      }

      const serviceClient = createServiceClient();
      const { error: updateError } = await serviceClient
        .from("profiles")
        .update({
          is_verified_student: true,
          ukim_email: azureEmail,
        })
        .eq("id", targetUserId);

      if (updateError) {
        throw new ApiError(500, "DB_ERROR", "Failed to verify student profile.");
      }

      const verificationRedirect = new URL("/profile/setup", baseUrl);
      verificationRedirect.searchParams.set("verified", "true");
      return NextResponse.redirect(verificationRedirect);
    }

    if (provider === "google") {
      const serviceClient = createServiceClient();
      const requestedRole = state.role;

      if (requestedRole) {
        await serviceClient
          .from("profiles")
          .update({ role: requestedRole })
          .eq("id", data.user.id);
      }

      const profile = await getProfileById(serviceClient, data.user.id);

      const redirectPath =
        profile?.role === "student" && !profile.is_verified_student
          ? "/auth/verify-student"
          : "/dashboard";

      return NextResponse.redirect(new URL(redirectPath, baseUrl));
    }

    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  });
}
