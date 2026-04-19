import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

// Returns the authenticated company's own listings (all statuses, not deleted)
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase, companyProfile } = await requireApprovedCompany(request);

    const { data, error, count } = await supabase
      .from("listings")
      .select(
        "id, title, description, listing_type, focus_area, experience_level, total_slots, slots_remaining, is_active, created_at, listing_skills(skill_id, skills(id, name, slug)), applications(id)",
        { count: "exact" }
      )
      .eq("company_profile_id", companyProfile.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load listings.");
    }

    const listings = (data || []).map((l) => ({
      ...l,
      application_count: Array.isArray(l.applications) ? l.applications.length : 0,
      applications: undefined,
    }));

    return NextResponse.json({ listings, total: count || 0 });
  });
}
