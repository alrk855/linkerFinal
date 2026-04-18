import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";
import {
  getAnonymousStudentCard,
  getSkillMatchScore,
} from "@/lib/supabase/queries";

type RouteParams = {
  params: {
    listing_id: string;
  };
};

function parseListingId(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid listing ID.");
  }

  return parsed.data;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { listing_id } = params;
    const listingId = parseListingId(listing_id);

    const { supabase, companyProfile } = await requireApprovedCompany(request);

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, company_profile_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load listing.");
    }

    if (!listing) {
      throw new ApiError(404, "NOT_FOUND", "Listing not found.");
    }

    if (listing.company_profile_id !== companyProfile.id) {
      throw new ApiError(403, "FORBIDDEN", "You do not own this listing.");
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select("id, listing_id, student_profile_id, cover_note, status, created_at, updated_at")
      .eq("listing_id", listingId);

    if (applicationsError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load applications.");
    }

    const enriched = await Promise.all(
      (applications || []).map(async (application) => {
        const [studentCard, skillMatchScore] = await Promise.all([
          getAnonymousStudentCard(supabase, application.student_profile_id),
          getSkillMatchScore(supabase, listingId, application.student_profile_id),
        ]);

        return {
          ...application,
          student_card: studentCard,
          skill_match_score: skillMatchScore,
        };
      })
    );

    enriched.sort((a, b) => b.skill_match_score - a.skill_match_score);

    return NextResponse.json({
      listing_id: listingId,
      applications: enriched,
    });
  });
}
