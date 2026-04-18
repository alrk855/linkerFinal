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
    const { data: existingProfile, error: usernameLookupError } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("username", payload.username)
      .maybeSingle();

    if (usernameLookupError) {
      throw new ApiError(500, "DB_ERROR", "Could not validate username.");
    }

    if (existingProfile) {
      throw new ApiError(
        409,
        "CONFLICT",
        "Username is already in use. Please choose another username."
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          username: payload.username,
          full_name: payload.full_name,
          role: payload.role,
        },
      },
    });

    if (error) {
      const loweredMessage = error.message.toLowerCase();
      if (loweredMessage.includes("already registered")) {
        throw new ApiError(409, "CONFLICT", "Email is already registered.");
      }

      throw new ApiError(400, "VALIDATION_ERROR", "Unable to sign up with provided credentials.");
    }

    if (!data.user?.id) {
      throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Signup did not return a user ID.");
    }

    const userId = data.user.id;

    // If signUp didn't create a session (e.g. email confirmation enabled),
    // explicitly sign in to establish a session so the user can proceed
    if (!data.session) {
      await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
    }

    // Verify profile was created by trigger, create fallback if not
    const { data: existingProfileRow } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!existingProfileRow) {
      const { error: profileInsertError } = await serviceClient
        .from("profiles")
        .insert({
          id: userId,
          username: payload.username,
          full_name: payload.full_name,
          role: payload.role,
        });

      if (profileInsertError) {
        console.error("Fallback profile creation failed:", profileInsertError);
        throw new ApiError(500, "DB_ERROR", "Failed to create user profile.");
      }
    }

    // Create role-specific profile
    if (payload.role === "student") {
      const { data: existingStudentProfile } = await serviceClient
        .from("student_profiles")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!existingStudentProfile) {
        const { error: studentInsertError } = await serviceClient
          .from("student_profiles")
          .insert({
            profile_id: userId,
          });

        if (studentInsertError) {
          console.error("Student profile creation failed:", studentInsertError);
        }
      }
    } else if (payload.role === "company") {
      const { data: existingCompanyProfile } = await serviceClient
        .from("company_profiles")
        .select("id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!existingCompanyProfile) {
        const { error: companyInsertError } = await serviceClient
          .from("company_profiles")
          .insert({
            profile_id: userId,
            company_name: payload.company_name || payload.full_name,
            company_email: payload.email,
            company_website: payload.website || null,
            approval_status: "pending",
          });

        if (companyInsertError) {
          console.error("Company profile creation failed:", companyInsertError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
    });
  });
}
