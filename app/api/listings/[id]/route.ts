import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany, requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import type { TablesUpdate } from "@/types/database";
import {
  parseJsonBody,
  listingUpdateBodySchema,
  uuidSchema,
} from "@/lib/api/validate";
import { getListingWithSkills, validateSkillIds } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: {
    id: string;
  };
};

function parseRouteId(input: string): string {
  const parsed = uuidSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid listing ID.");
  }

  return parsed.data;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = params;
    const listingId = parseRouteId(id);
    const { user, profile, supabase } = await requireAuth(request);

    const listing = await getListingWithSkills(supabase, listingId);
    if (!listing) {
      throw new ApiError(404, "NOT_FOUND", "Listing not found.");
    }

    const company = Array.isArray(listing.company_profiles)
      ? listing.company_profiles[0]
      : listing.company_profiles;

    const result: Record<string, unknown> = {
      ...listing,
    };

    if (profile.role === "student") {
      const { data: application, error: applicationError } = await supabase
        .from("applications")
        .select("id")
        .eq("listing_id", listingId)
        .eq("student_profile_id", user.id)
        .maybeSingle();

      if (applicationError) {
        throw new ApiError(500, "DB_ERROR", "Failed to resolve application status.");
      }

      result.has_applied = Boolean(application);
    }

    if (profile.role === "company" && company?.profile_id === user.id) {
      const [{ count: acknowledgmentCount, error: ackError }, { count: applicationCount, error: appError }] =
        await Promise.all([
          supabase
            .from("acknowledgments")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", listingId),
          supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", listingId),
        ]);

      if (ackError || appError) {
        throw new ApiError(500, "DB_ERROR", "Failed to load listing metrics.");
      }

      result.acknowledgment_count = acknowledgmentCount || 0;
      result.application_count = applicationCount || 0;
    }

    return NextResponse.json({ listing: result });
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = params;
    const listingId = parseRouteId(id);
    const { supabase, companyProfile } = await requireApprovedCompany(request);
    const payload = await parseJsonBody(request, listingUpdateBodySchema);

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, company_profile_id, slots_remaining")
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

    if (payload.is_active === true && listing.slots_remaining === 0) {
      throw new ApiError(
        422,
        "SLOT_EXHAUSTED",
        "Cannot reactivate a listing with zero remaining slots."
      );
    }

    const listingUpdates: TablesUpdate<"listings"> = {};
    if (payload.title !== undefined) listingUpdates.title = payload.title;
    if (payload.description !== undefined) listingUpdates.description = payload.description;
    if (payload.is_active !== undefined) listingUpdates.is_active = payload.is_active;

    if (Object.keys(listingUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from("listings")
        .update(listingUpdates)
        .eq("id", listingId);

      if (updateError) {
        throw new ApiError(500, "DB_ERROR", "Failed to update listing.");
      }
    }

    if (payload.skill_ids !== undefined) {
      const uniqueSkillIds = Array.from(new Set(payload.skill_ids));
      await validateSkillIds(supabase, uniqueSkillIds);

      const { error: deleteSkillsError } = await supabase
        .from("listing_skills")
        .delete()
        .eq("listing_id", listingId);

      if (deleteSkillsError) {
        throw new ApiError(500, "DB_ERROR", "Failed to replace listing skills.");
      }

      if (uniqueSkillIds.length > 0) {
        const { error: insertSkillsError } = await supabase.from("listing_skills").insert(
          uniqueSkillIds.map((skillId) => ({
            listing_id: listingId,
            skill_id: skillId,
          }))
        );

        if (insertSkillsError) {
          throw new ApiError(500, "DB_ERROR", "Failed to add listing skills.");
        }
      }
    }

    const updatedListing = await getListingWithSkills(supabase, listingId);

    return NextResponse.json({ listing: updatedListing });
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = params;
    const listingId = parseRouteId(id);
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

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        is_deleted: true,
        is_active: false,
      })
      .eq("id", listingId);

    if (updateError) {
      throw new ApiError(500, "DB_ERROR", "Failed to delete listing.");
    }

    return NextResponse.json({ success: true });
  });
}
