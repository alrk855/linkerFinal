import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { parseJsonBody, profileUpdateBodySchema } from "@/lib/api/validate";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import {
  getCompanyByProfileId,
  getStudentProfileByProfileId,
  getStudentSkillsDetailed,
} from "@/lib/supabase/queries";

const PROFILE_FIELD_KEYS = [
  "full_name",
  "bio",
  "github_url",
  "linkedin_url",
  "portfolio_url",
  "website_url",
  "phone",
] as const;

const STUDENT_FIELD_KEYS = [
  "faculty",
  "year_of_study",
  "degree_type",
  "graduation_year",
  "experience_level",
  "focus_area",
  "short_description",
] as const;

const COMPANY_FIELD_KEYS = [
  "company_name",
  "company_description",
  "company_website",
  "industry",
  "size_range",
  "location",
] as const;

async function buildProfileResponse(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  profileId: string,
  role: string
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (profileError || !profile) {
    throw new ApiError(404, "NOT_FOUND", "Profile not found.");
  }

  if (role === "student") {
    const studentProfile = await getStudentProfileByProfileId(supabase, profileId);
    const studentSkills = await getStudentSkillsDetailed(supabase, profileId);

    return {
      ...profile,
      student_profile: studentProfile,
      student_skills: studentSkills || [],
    };
  }

  if (role === "company") {
    const companyProfile = await getCompanyByProfileId(supabase, profileId);

    return {
      ...profile,
      company_profile: companyProfile,
    };
  }

  return profile;
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, profile, supabase } = await requireAuth(request);

    const result = await buildProfileResponse(supabase, user.id, profile.role);
    return NextResponse.json({ profile: result });
  });
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, profile, supabase } = await requireAuth(request);
    const payload = await parseJsonBody(request, profileUpdateBodySchema);

    const profileUpdates = Object.fromEntries(
      PROFILE_FIELD_KEYS.filter((key) => key in payload).map((key) => [key, payload[key]])
    ) as TablesUpdate<"profiles">;

    const studentUpdates = Object.fromEntries(
      STUDENT_FIELD_KEYS.filter((key) => key in payload).map((key) => [key, payload[key]])
    ) as TablesUpdate<"student_profiles">;

    const companyUpdates = Object.fromEntries(
      COMPANY_FIELD_KEYS.filter((key) => key in payload).map((key) => [key, payload[key]])
    ) as TablesUpdate<"company_profiles">;

    if (profile.role === "student" && Object.keys(companyUpdates).length > 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Company profile fields are not allowed for student accounts."
      );
    }

    if (profile.role === "company" && Object.keys(studentUpdates).length > 0) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Student profile fields are not allowed for company accounts."
      );
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id);

      if (profileUpdateError) {
        throw new ApiError(500, "DB_ERROR", "Failed to update profile.");
      }
    }

    if (profile.role === "student" && Object.keys(studentUpdates).length > 0) {
      const studentUpsertPayload: TablesInsert<"student_profiles"> = {
        profile_id: user.id,
        ...studentUpdates,
      };

      const { error: studentUpdateError } = await supabase
        .from("student_profiles")
        .upsert(studentUpsertPayload, { onConflict: "profile_id" });

      if (studentUpdateError) {
        throw new ApiError(500, "DB_ERROR", "Failed to update student profile.");
      }
    }

    if (profile.role === "company" && Object.keys(companyUpdates).length > 0) {
      const { error: companyUpdateError } = await supabase
        .from("company_profiles")
        .update(companyUpdates)
        .eq("profile_id", user.id);

      if (companyUpdateError) {
        throw new ApiError(500, "DB_ERROR", "Failed to update company profile.");
      }
    }

    const updated = await buildProfileResponse(supabase, user.id, profile.role);
    return NextResponse.json({ profile: updated });
  });
}
