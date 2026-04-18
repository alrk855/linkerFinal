import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import {
  parseJsonBody,
  applicationsUpdateBodySchema,
  uuidSchema,
} from "@/lib/api/validate";

type RouteParams = {
  params: {
    id: string;
  };
};

function parseApplicationId(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid application ID.");
  }

  return parsed.data;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = params;
    const applicationId = parseApplicationId(id);

    const { supabase, companyProfile } = await requireApprovedCompany(request);
    const payload = await parseJsonBody(request, applicationsUpdateBodySchema);

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .select("id, listing_id, student_profile_id, status")
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load application.");
    }

    if (!application) {
      throw new ApiError(404, "NOT_FOUND", "Application not found.");
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, company_profile_id")
      .eq("id", application.listing_id)
      .maybeSingle();

    if (listingError) {
      throw new ApiError(500, "DB_ERROR", "Failed to validate listing ownership.");
    }

    if (!listing || listing.company_profile_id !== companyProfile.id) {
      throw new ApiError(403, "FORBIDDEN", "You do not own this application listing.");
    }

    const { data: updated, error: updateError } = await supabase
      .from("applications")
      .update({ status: payload.status })
      .eq("id", applicationId)
      .select("*")
      .single();

    if (updateError) {
      throw new ApiError(500, "DB_ERROR", "Failed to update application.");
    }

    let acknowledgmentCreated = false;

    if (payload.status === "acknowledged") {
      const { data: existingAck, error: existingAckError } = await supabase
        .from("acknowledgments")
        .select("id")
        .eq("listing_id", application.listing_id)
        .eq("student_profile_id", application.student_profile_id)
        .maybeSingle();

      if (existingAckError) {
        throw new ApiError(500, "DB_ERROR", "Failed to validate acknowledgment state.");
      }

      if (!existingAck) {
        const { error: acknowledgmentError } = await supabase
          .from("acknowledgments")
          .insert({
            listing_id: application.listing_id,
            company_profile_id: companyProfile.id,
            student_profile_id: application.student_profile_id,
          });

        if (acknowledgmentError) {
          const lowered = acknowledgmentError.message.toLowerCase();
          if (lowered.includes("no slots remaining")) {
            throw new ApiError(
              422,
              "SLOT_EXHAUSTED",
              "No slots remaining for acknowledgment creation."
            );
          }

          throw new ApiError(500, "DB_ERROR", "Failed to create acknowledgment.");
        }

        acknowledgmentCreated = true;
      }
    }

    return NextResponse.json({
      application: updated,
      acknowledgment_created: acknowledgmentCreated,
    });
  });
}
