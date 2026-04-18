import { NextRequest, NextResponse } from "next/server";
import { requireVerifiedStudent } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { parseJsonBody, applicationsCreateBodySchema } from "@/lib/api/validate";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireVerifiedStudent(request);
    const payload = await parseJsonBody(request, applicationsCreateBodySchema);

    const { data: existing, error: existingError } = await supabase
      .from("applications")
      .select("id")
      .eq("listing_id", payload.listing_id)
      .eq("student_profile_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw new ApiError(500, "DB_ERROR", "Failed to check existing application.");
    }

    if (existing) {
      throw new ApiError(409, "CONFLICT", "You already applied to this listing.");
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, is_active, is_deleted, slots_remaining")
      .eq("id", payload.listing_id)
      .maybeSingle();

    if (listingError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load listing.");
    }

    if (!listing || !listing.is_active || listing.is_deleted) {
      throw new ApiError(400, "BUSINESS_RULE_VIOLATION", "Listing is not available.");
    }

    if (listing.slots_remaining <= 0) {
      throw new ApiError(422, "SLOT_EXHAUSTED", "Listing has no remaining slots.");
    }

    const { data: created, error: insertError } = await supabase
      .from("applications")
      .insert({
        listing_id: payload.listing_id,
        student_profile_id: user.id,
        cover_note: payload.cover_note || null,
      })
      .select("*")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        throw new ApiError(409, "CONFLICT", "You already applied to this listing.");
      }

      throw new ApiError(500, "DB_ERROR", "Failed to create application.");
    }

    return NextResponse.json({ application: created }, { status: 201 });
  });
}
