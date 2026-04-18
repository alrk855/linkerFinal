import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import {
  parseJsonBody,
  acknowledgmentsUpdateBodySchema,
  uuidSchema,
} from "@/lib/api/validate";

type RouteParams = {
  params: {
    id: string;
  };
};

function parseAcknowledgmentId(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid acknowledgment ID.");
  }

  return parsed.data;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = params;
    const acknowledgmentId = parseAcknowledgmentId(id);

    const { user, supabase } = await requireRole(request, "student");
    const payload = await parseJsonBody(request, acknowledgmentsUpdateBodySchema);

    const { data: updated, error: updateError } = await (supabase
      .from("acknowledgments") as any)
      .update({ status: payload.status })
      .eq("id", acknowledgmentId)
      .eq("student_profile_id", user.id)
      .eq("status", "pending")
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw new ApiError(500, "DB_ERROR", "Failed to update acknowledgment status.");
    }

    if (!updated) {
      throw new ApiError(
        400,
        "BUSINESS_RULE_VIOLATION",
        "Acknowledgment not found, not owned by user, or no longer pending."
      );
    }

    return NextResponse.json({ acknowledgment: updated });
  });
}
