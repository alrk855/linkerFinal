import { NextRequest, NextResponse } from "next/server";
import { createRedirectClient, createServiceClient } from "@/lib/supabase/server";
import { getProfileById } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

const GOOGLE_ROLE_COOKIE = "linker_oauth_role";
const VERIFY_USER_COOKIE = "linker_verify_user_id";

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
  for (const c of candidates) {
    try {
      const p = JSON.parse(c);
      if (p && typeof p === "object") return p as OAuthState;
    } catch {}
  }
  return {};
}

function isUkimEmail(email: string): boolean {
  const n = email.toLowerCase();
  return n.endsWith("@ukim.edu.mk") || n.endsWith(".ukim.edu.mk") ||
    (n.includes("@") && (n.split("@")[1]?.endsWith(".ukim.edu.mk") ?? false));
}

function clearFlowCookies(response: NextResponse) {
  response.cookies.delete(GOOGLE_ROLE_COOKIE);
  response.cookies.delete(VERIFY_USER_COOKIE);
  return response;
}

function signinErrorUrl(appOrigin: string, code: string, reason?: string): URL {
  const url = new URL("/auth/signin", appOrigin);
  url.searchParams.set("error", code);
  if (reason) {
    url.searchParams.set("reason", reason.slice(0, 180));
  }
  return url;
}

export async function GET(request: NextRequest) {
  const appOrigin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return clearFlowCookies(
      NextResponse.redirect(signinErrorUrl(appOrigin, "missing_code"))
    );
  }

  const { supabase, finish } = createRedirectClient(request);

  let data, error;
  try {
    const result = await supabase.auth.exchangeCodeForSession(code);
    data = result.data;
    error = result.error;
  } catch (e) {
    console.error("exchangeCodeForSession threw:", e);
    const reason = e instanceof Error ? e.message : "exchange_exception";
    return finish(
      clearFlowCookies(
        NextResponse.redirect(signinErrorUrl(appOrigin, "exchange_exception", reason))
      )
    );
  }

  if (error || !data?.user) {
    console.error("OAuth exchange failed:", error?.message);
    return finish(
      clearFlowCookies(
        NextResponse.redirect(
          signinErrorUrl(appOrigin, "oauth_exchange_failed", error?.message)
        )
      )
    );
  }

  const roleCookie = request.cookies.get(GOOGLE_ROLE_COOKIE)?.value;
  const requestedRoleFromCookie = roleCookie === "student" || roleCookie === "company"
    ? roleCookie
    : undefined;
  const verifyUserIdFromCookie = request.cookies.get(VERIFY_USER_COOKIE)?.value;

  const queryProvider = request.nextUrl.searchParams.get("provider");
  const sessionProvider = data.session?.user.app_metadata.provider || data.user.app_metadata.provider;
  const provider = (queryProvider || sessionProvider || "").toLowerCase();
  const state = parseOAuthState(request.nextUrl.searchParams.get("state"));

  let redirectPath = "/dashboard";

  try {
    if (provider === "azure_ad" || provider === "azure") {
      const azureEmail = data.user.email;
      const targetUserId = verifyUserIdFromCookie || state.userId;

      if (!targetUserId) {
        redirectPath = "/auth/verify-student?error=missing_state";
      } else if (!azureEmail || !isUkimEmail(azureEmail)) {
        redirectPath = "/auth/verify-student?error=invalid_ukim_email";
      } else {
        const svc = createServiceClient();
        await svc.from("profiles").update({
          is_verified_student: true,
          ukim_email: azureEmail,
        }).eq("id", targetUserId);
        redirectPath = "/dashboard?verified=true";
      }
    } else if (provider === "google") {
      const svc = createServiceClient();
      const requestedRole = requestedRoleFromCookie || state.role;
      const existing = await getProfileById(svc, data.user.id).catch(() => null);

      if (!existing) {
        const base = (data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "user")
          .toLowerCase().replace(/[^a-z0-9_]/g, "_").substring(0, 15);
        const username = `${base}_${Date.now().toString(36)}`.substring(0, 20);

        await svc.from("profiles").insert({
          id: data.user.id,
          username,
          full_name: data.user.user_metadata?.full_name || null,
          role: requestedRole || "student",
        });

        if (requestedRole === "company") {
          await svc.from("company_profiles").insert({
            profile_id: data.user.id,
            company_name: data.user.user_metadata?.full_name || "Company",
            company_email: data.user.email!,
            approval_status: "pending",
          });
        } else {
          await svc.from("student_profiles").insert({ profile_id: data.user.id });
        }
      } else if (requestedRole && existing.role !== requestedRole) {
        await svc.from("profiles").update({ role: requestedRole }).eq("id", data.user.id);
      }

      const profile = existing || await getProfileById(svc, data.user.id).catch(() => null);
      redirectPath = (profile?.role === "student" && !profile.is_verified_student)
        ? "/auth/verify-student"
        : "/dashboard";
    }
  } catch (e) {
    console.error("Post-exchange logic failed:", e);
    // Session is still valid, just redirect to dashboard
    redirectPath = "/dashboard";
  }

  return finish(
    clearFlowCookies(NextResponse.redirect(new URL(redirectPath, appOrigin)))
  );
}
