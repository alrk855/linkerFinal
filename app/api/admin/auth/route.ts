import { timingSafeEqual } from "crypto";
import * as bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { parseJsonBody, adminAuthBodySchema } from "@/lib/api/validate";
import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/api/admin-token";
export const dynamic = "force-dynamic";

type GoogleTokenInfo = {
  email?: string;
  email_verified?: string;
  aud?: string;
};

function isBcryptHash(value: string): boolean {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
}

function safeCompare(plain: string, expected: string): boolean {
  const plainBuffer = Buffer.from(plain);
  const expectedBuffer = Buffer.from(expected);

  if (plainBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(plainBuffer, expectedBuffer);
}

async function validateMasterPassword(providedPassword: string): Promise<boolean> {
  const configuredPassword = process.env.ADMIN_MASTER_PASSWORD;

  if (!configuredPassword) {
    throw new ApiError(
      500,
      "CONFIG_ERROR",
      "ADMIN_MASTER_PASSWORD is not configured."
    );
  }

  if (isBcryptHash(configuredPassword)) {
    return bcrypt.compare(providedPassword, configuredPassword);
  }

  return safeCompare(providedPassword, configuredPassword);
}

async function validateGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid Google identity token.");
  }

  const payload = (await response.json()) as GoogleTokenInfo;
  if (!payload.email || payload.email_verified !== "true") {
    throw new ApiError(401, "UNAUTHORIZED", "Google email is not verified.");
  }

  if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(401, "UNAUTHORIZED", "Google token audience mismatch.");
  }

  return payload;
}

function getEnvAdminWhitelist(): Set<string> {
  return new Set(
    (process.env.ADMIN_WHITELISTED_EMAILS || "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const payload = await parseJsonBody(request, adminAuthBodySchema);

    const isPasswordValid = await validateMasterPassword(payload.master_password);
    if (!isPasswordValid) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid admin credentials.");
    }

    const googleIdentity = await validateGoogleIdToken(payload.google_id_token);
    const normalizedEmail = googleIdentity.email!.toLowerCase();

    const serviceClient = createServiceClient();
    const { data: whitelistRow, error: whitelistError } = await serviceClient
      .from("admin_whitelist")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (whitelistError) {
      throw new ApiError(500, "DB_ERROR", "Failed to validate admin whitelist.");
    }

    const envWhitelist = getEnvAdminWhitelist();
    const isAllowed = envWhitelist.has(normalizedEmail) || Boolean(whitelistRow);

    if (!isAllowed) {
      throw new ApiError(403, "FORBIDDEN", "This email is not authorized for admin access.");
    }

    const userClient = await createClient();
    const {
      data: { user },
    } = await userClient.auth.getUser();

    const token = await signAdminToken({
      email: normalizedEmail,
      profileId: user?.id,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return response;
  });
}
