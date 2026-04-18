import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import {
  getCompanyByProfileId,
  getProfileById,
} from "@/lib/supabase/queries";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/api/admin-token";
import { ApiError } from "@/lib/api/errors";

type AuthContext = {
  user: User;
  profile: Tables<"profiles">;
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export async function requireAuth(_request: NextRequest): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const profile = await getProfileById(supabase, user.id);
  if (!profile) {
    throw new ApiError(404, "NOT_FOUND", "Profile not found.");
  }

  return { user, profile, supabase };
}

export async function requireRole(
  request: NextRequest,
  role: Tables<"profiles">["role"]
): Promise<AuthContext> {
  const context = await requireAuth(request);

  if (context.profile.role !== role) {
    throw new ApiError(403, "FORBIDDEN", "You are not authorized for this action.");
  }

  return context;
}

export async function requireVerifiedStudent(
  request: NextRequest
): Promise<AuthContext> {
  const context = await requireRole(request, "student");

  if (!context.profile.is_verified_student) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only verified students can access this resource."
    );
  }

  return context;
}

export async function requireApprovedCompany(request: NextRequest): Promise<
  AuthContext & {
    companyProfile: Tables<"company_profiles">;
  }
> {
  const context = await requireRole(request, "company");
  const companyProfile = await getCompanyByProfileId(context.supabase, context.user.id);

  if (!companyProfile || companyProfile.approval_status !== "approved") {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only approved companies can access this resource."
    );
  }

  return {
    ...context,
    companyProfile,
  };
}

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    throw new ApiError(403, "FORBIDDEN", "Admin authentication is required.");
  }

  return verifyAdminToken(token);
}
