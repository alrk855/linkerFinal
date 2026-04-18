import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { createServiceClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

type OAuthState = {
  userId?: string;
  role?: "student" | "company";
  flow?: string;
};

function parseOAuthState(rawState: string | null): OAuthState {
  if (!rawState) return {};

  const candidates = [rawState];
  try { candidates.push(decodeURIComponent(rawState)); } catch {}
  try { candidates.push(Buffer.from(rawState, "base64url").toString("utf-8")); } catch {}
  try { candidates.push(Buffer.from(rawState, "base64").toString("utf-8")); } catch {}

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") return parsed as OAuthState;
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
    (normalized.includes("@") && normalized.split("@")[1]?.endsWith(".ukim.edu.mk"))
  );
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const url = request.nextUrl;
  const code = url.searchParams.get("code");

  if (!code) {
    const redirect = new URL("/auth/signin", baseUrl);
    redirect.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirect);
  }

  // Collect cookies that Supabase sets during exchangeCodeForSession
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("OAuth code exchange failed:", error?.message);
    const redirect = new URL("/auth/signin", baseUrl);
    redirect.searchParams.set("error", "oauth_exchange_failed");
    return NextResponse.redirect(redirect);
  }

  // Determine redirect path based on provider
  const queryProvider = url.searchParams.get("provider");
  const sessionProvider =
    data.session?.user.app_metadata.provider || data.user.app_metadata.provider;
  const provider = (queryProvider || sessionProvider || "").toLowerCase();
  const state = parseOAuthState(url.searchParams.get("state"));

  let redirectPath = "/dashboard";

  if (provider === "azure_ad" || provider === "azure") {
    const azureEmail = data.user.email;
    const targetUserId = state.userId;

    if (!targetUserId) {
      redirectPath = "/auth/verify-student?error=missing_state";
    } else if (!azureEmail || !isUkimEmail(azureEmail)) {
      redirectPath = "/auth/verify-student?error=invalid_ukim_email";
    } else {
      const serviceClient = createServiceClient();
      const { error: updateError } = await serviceClient
        .from("profiles")
        .update({
          is_verified_student: true,
          ukim_email: azureEmail,
        })
        .eq("id", targetUserId);

      if (updateError) {
        console.error("Failed to verify student profile:", updateError);
        redirectPath = "/auth/verify-student?error=verification_failed";
      } else {
        redirectPath = "/dashboard?verified=true";
      }
    }
  } else if (provider === "google") {
    const serviceClient = createServiceClient();
    const requestedRole = state.role;

    // For new Google signups, ensure a profile exists
    const existingProfile = await getProfileById(serviceClient, data.user.id).catch(() => null);

    if (!existingProfile) {
      // New Google user — create profile
      const username = (data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .substring(0, 20);

      await serviceClient.from("profiles").insert({
        id: data.user.id,
        username: `${username}_${Date.now().toString(36)}`.substring(0, 20),
        full_name: data.user.user_metadata?.full_name || null,
        role: requestedRole || "student",
      });

      // Create role-specific profile
      if (requestedRole === "company") {
        await serviceClient.from("company_profiles").insert({
          profile_id: data.user.id,
          company_name: data.user.user_metadata?.full_name || "Company",
          company_email: data.user.email!,
          approval_status: "pending",
        });
      } else {
        await serviceClient.from("student_profiles").insert({
          profile_id: data.user.id,
        });
      }
    } else if (requestedRole && existingProfile.role !== requestedRole) {
      await serviceClient
        .from("profiles")
        .update({ role: requestedRole })
        .eq("id", data.user.id);
    }

    const profile = existingProfile || (await getProfileById(serviceClient, data.user.id).catch(() => null));

    redirectPath =
      profile?.role === "student" && !profile.is_verified_student
        ? "/auth/verify-student"
        : "/dashboard";
  }

  // Build redirect response and attach all session cookies
  const response = NextResponse.redirect(new URL(redirectPath, baseUrl));
  for (const cookie of pendingCookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
