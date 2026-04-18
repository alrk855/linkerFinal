import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { ApiError } from "@/lib/api/errors";

export const ADMIN_COOKIE_NAME = "linker_admin_token";

export type AdminTokenPayload = JWTPayload & {
  role: "admin";
  email: string;
  profileId?: string;
};

function getAdminTokenSecret(): Uint8Array {
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_MASTER_PASSWORD;

  if (!secret) {
    throw new ApiError(
      500,
      "CONFIG_ERROR",
      "Admin auth is not configured correctly."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function signAdminToken(payload: {
  email: string;
  profileId?: string;
}): Promise<string> {
  const secret = getAdminTokenSecret();

  return new SignJWT({
    role: "admin",
    email: payload.email,
    ...(payload.profileId ? { profileId: payload.profileId } : {}),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload> {
  const secret = getAdminTokenSecret();

  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as AdminTokenPayload;

    if (payload.role !== "admin" || !payload.email) {
      throw new ApiError(403, "FORBIDDEN", "Invalid admin token.");
    }

    return payload;
  } catch {
    throw new ApiError(403, "FORBIDDEN", "Invalid or expired admin token.");
  }
}
