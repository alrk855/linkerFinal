import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { getClientIp, enforceRateLimit } from "@/lib/api/rate-limit";
import { parseJsonBody, signupBodySchema } from "@/lib/api/validate";

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

    return NextResponse.json({
      success: true,
      user_id: data.user.id,
    });
  });
}
