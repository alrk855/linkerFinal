import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { getClientIp, enforceRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, signinBodySchema } from "@/lib/api/validate";
export const dynamic = "force-dynamic";

async function resolveEmailFromIdentifier(identifier: string): Promise<string | null> {
  if (identifier.includes("@")) {
    return identifier;
  }

  const serviceClient = createServiceClient();
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("id")
    .eq("username", identifier)
    .maybeSingle();

  if (profileError) {
    throw new ApiError(500, "DB_ERROR", "Failed to resolve username.");
  }

  if (!profile) {
    return null;
  }

  const { data: userData, error: authError } = await serviceClient.auth.admin.getUserById(
    profile.id
  );

  if (authError) {
    throw new ApiError(500, "DB_ERROR", "Failed to resolve account email.");
  }

  return userData.user?.email || null;
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const ip = getClientIp(request);
    enforceRateLimit({
      key: `auth:signin:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
      message: "Too many signin attempts. Please try again later.",
    });

    const payload = await parseJsonBody(request, signinBodySchema);
    const email = await resolveEmailFromIdentifier(payload.identifier);

    if (!email) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: payload.password,
    });

    if (error || !data.user) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials.");
    }

    return NextResponse.json({
      success: true,
      session: data.session,
      user: data.user,
    });
  });
}
