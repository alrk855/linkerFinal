import type { Database, Tables } from "@/types/database";
import type {
  createClient,
  createServiceClient,
} from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";

type AppSupabaseClient =
  | Awaited<ReturnType<typeof createClient>>
  | ReturnType<typeof createServiceClient>;

export async function getProfileById(
  supabase: AppSupabaseClient,
  id: string
): Promise<Tables<"profiles"> | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to fetch profile.");
  }

  return data;
}

export async function getProfileByUsername(
  supabase: AppSupabaseClient,
  username: string
): Promise<Tables<"profiles"> | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to fetch profile by username.");
  }

  return data;
}

export async function getCompanyByProfileId(
  supabase: AppSupabaseClient,
  profileId: string
): Promise<Tables<"company_profiles"> | null> {
  const { data, error } = await supabase
    .from("company_profiles")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to fetch company profile.");
  }

  return data;
}

export async function getStudentProfileByProfileId(
  supabase: AppSupabaseClient,
  profileId: string
): Promise<Tables<"student_profiles"> | null> {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to fetch student profile.");
  }

  return data;
}

export async function getStudentSkillsDetailed(
  supabase: AppSupabaseClient,
  profileId: string
) {
  const { data, error } = await supabase
    .from("student_skills")
    .select(
      "id, created_at, skill_id, skills(id, name, slug, category_id, skill_categories(id, name, slug))"
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to fetch student skills.");
  }

  return data;
}

export async function getListingWithSkills(
  supabase: AppSupabaseClient,
  listingId: string
) {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, company_profiles(id, profile_id, company_name, logo_url, approval_status), listing_skills(id, skill_id, skills(id, name, slug, category_id))"
    )
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to fetch listing.");
  }

  return data;
}

export async function getAnonymousStudentCard(
  supabase: AppSupabaseClient,
  profileId: string
) {
  const { data, error } = await supabase.rpc("get_anonymous_student_card", {
    p_student_profile_id: profileId,
  });

  if (error) {
    throw new ApiError(
      500,
      "DB_ERROR",
      "Failed to fetch anonymized student card."
    );
  }

  return data;
}

export async function getSkillMatchScore(
  supabase: AppSupabaseClient,
  listingId: string,
  profileId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("get_skill_match_score", {
    p_listing_id: listingId,
    p_student_profile_id: profileId,
  });

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to calculate skill match score.");
  }

  return data ?? 0;
}

export async function validateSkillIds(
  supabase: AppSupabaseClient,
  skillIds: string[]
): Promise<void> {
  if (skillIds.length === 0) {
    return;
  }

  const { data, error } = await supabase
    .from("skills")
    .select("id")
    .in("id", skillIds);

  if (error) {
    throw new ApiError(500, "DB_ERROR", "Failed to validate skill IDs.");
  }

  if ((data?.length || 0) !== skillIds.length) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "One or more skills do not exist."
    );
  }
}
