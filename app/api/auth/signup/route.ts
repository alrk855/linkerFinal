import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { getClientIp, enforceRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, signupBodySchema } from "@/lib/api/validate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const ip = getClientIp(request);
    enforceRateLimit({
      key: `auth:signup:${ip}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
      message: "Too many signup attempts. Please try again later.",
    });

    const payload = await parseJsonBody(request, signupBodySchema);
    const serviceClient = createServiceClient();

    // Check username uniqueness
    const { data: existingProfile, error: usernameLookupError } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("username", payload.username)
      .maybeSingle();

    if (usernameLookupError) {
      throw new ApiError(500, "DB_ERROR", "Could not validate username.");
    }
    if (existingProfile) {
      throw new ApiError(409, "CONFLICT", "Username is already in use. Please choose another username.");
    }

    // Create user via admin API — bypasses email confirmation entirely
    const { data: adminData, error: adminError } = await serviceClient.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true, // Mark email as confirmed immediately
      user_metadata: {
        username: payload.username,
        full_name: payload.full_name,
        role: payload.role,
      },
    });

    if (adminError) {
      const msg = adminError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
        throw new ApiError(409, "CONFLICT", "Email is already registered.");
      }
      console.error("Admin createUser failed:", adminError);
      throw new ApiError(400, "VALIDATION_ERROR", "Unable to create account.");
    }

    if (!adminData.user?.id) {
      throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Signup did not return a user ID.");
    }

    const userId = adminData.user.id;

    // Now sign the user in to establish a session (sets cookies via cookies())
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (signInError) {
      console.error("Post-signup signIn failed:", signInError);
      // User was created but session failed — they can still sign in manually
    }

    // Ensure profile exists (trigger may or may not have fired)
    const { data: existingProfileRow } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfileRow) {
      const { error: profileInsertError } = await serviceClient.from("profiles").insert({
        id: userId,
        username: payload.username,
        full_name: payload.full_name,
        role: payload.role,
      });
      if (profileInsertError) {
        console.error("Profile creation failed:", profileInsertError);
        throw new ApiError(500, "DB_ERROR", "Failed to create user profile.");
      }
    }

    // Create role-specific profile
    if (payload.role === "student") {
      const { data: sp } = await serviceClient
        .from("student_profiles")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!sp) {
        await serviceClient.from("student_profiles").insert({ profile_id: userId });
      }
    } else if (payload.role === "company") {
      const { data: cp } = await serviceClient
        .from("company_profiles")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!cp) {
        await serviceClient.from("company_profiles").insert({
          profile_id: userId,
          company_name: payload.company_name || payload.full_name,
          company_email: payload.email,
          company_website: payload.website || null,
          approval_status: "pending",
        });
      }
    }

    return NextResponse.json({ success: true, user_id: userId });
  });
}
