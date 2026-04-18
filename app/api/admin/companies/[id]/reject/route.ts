import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import { createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import {
  parseJsonBody,
  adminRejectBodySchema,
  uuidSchema,
} from "@/lib/api/validate";

type RouteParams = {
  params: {
    id: string;
  };
};

function parseCompanyId(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid company profile ID.");
  }

  return parsed.data;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    await requireAdmin(request);

    const { id } = params;
    const companyId = parseCompanyId(id);
    const payload = await parseJsonBody(request, adminRejectBodySchema);

    const supabase = createServiceClient();
    const { data: company, error: companyError } = await supabase
      .from("company_profiles")
      .select("id")
      .eq("id", companyId)
      .maybeSingle();

    if (companyError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load company profile.");
    }

    if (!company) {
      throw new ApiError(404, "NOT_FOUND", "Company profile not found.");
    }

    const { data: updated, error: updateError } = await supabase
      .from("company_profiles")
      .update({
        approval_status: "rejected",
        rejection_reason: payload.reason,
      })
      .eq("id", companyId)
      .select("*")
      .single();

    if (updateError) {
      throw new ApiError(500, "DB_ERROR", "Failed to reject company.");
    }

    return NextResponse.json({ company: updated });
  });
}
