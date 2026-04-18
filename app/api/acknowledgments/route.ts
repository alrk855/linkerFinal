import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import {
  parseJsonBody,
  acknowledgmentsCreateBodySchema,
} from "@/lib/api/validate";
import { enforceRateLimit } from "@/lib/api/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase, companyProfile } = await requireApprovedCompany(request);
    const payload = await parseJsonBody(request, acknowledgmentsCreateBodySchema);

    enforceRateLimit({
      key: `ack:create:${companyProfile.id}`,
      limit: 50,
      windowMs: 24 * 60 * 60 * 1000,
      message: "Acknowledgment rate limit reached for today.",
    });

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, company_profile_id, is_active, is_deleted")
      .eq("id", payload.listing_id)
      .maybeSingle();

    if (listingError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load listing.");
    }

    if (!listing) {
      throw new ApiError(404, "NOT_FOUND", "Listing not found.");
    }

    if (listing.company_profile_id !== companyProfile.id) {
      throw new ApiError(403, "FORBIDDEN", "You can only acknowledge from your own listings.");
    }

    if (!listing.is_active || listing.is_deleted) {
      throw new ApiError(400, "BUSINESS_RULE_VIOLATION", "Listing is not active.");
    }

    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, role, is_verified_student")
      .eq("id", payload.student_profile_id)
      .maybeSingle();

    if (studentError) {
      throw new ApiError(500, "DB_ERROR", "Failed to validate student profile.");
    }

    if (!student || student.role !== "student" || !student.is_verified_student) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Target user must be a verified student."
      );
    }

    const { data: existingAck, error: existingAckError } = await supabase
      .from("acknowledgments")
      .select("id")
      .eq("listing_id", payload.listing_id)
      .eq("student_profile_id", payload.student_profile_id)
      .maybeSingle();

    if (existingAckError) {
      throw new ApiError(500, "DB_ERROR", "Failed to validate acknowledgment uniqueness.");
    }

    if (existingAck) {
      throw new ApiError(409, "CONFLICT", "Acknowledgment already exists for this student and listing.");
    }

    const { data: created, error: insertError } = await supabase
      .from("acknowledgments")
      .insert({
        listing_id: payload.listing_id,
        company_profile_id: companyProfile.id,
        student_profile_id: payload.student_profile_id,
      })
      .select("*")
      .single();

    if (insertError) {
      const lowered = insertError.message.toLowerCase();
      if (lowered.includes("no slots remaining")) {
        throw new ApiError(422, "SLOT_EXHAUSTED", "No slots remaining for this listing.");
      }

      if (insertError.code === "23505") {
        throw new ApiError(409, "CONFLICT", "Acknowledgment already exists.");
      }

      throw new ApiError(500, "DB_ERROR", "Failed to create acknowledgment.");
    }

    return NextResponse.json({ acknowledgment: created }, { status: 201 });
  });
}
