import { NextRequest, NextResponse } from "next/server";
import { requireVerifiedStudent } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";

type RouteParams = {
  params: {
    company_profile_id: string;
  };
};

function parseCompanyProfileId(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid company profile ID.");
  }

  return parsed.data;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { company_profile_id } = params;
    const companyProfileId = parseCompanyProfileId(company_profile_id);

    const { user, supabase } = await requireVerifiedStudent(request);

    const { error } = await supabase
      .from("company_subscriptions")
      .delete()
      .eq("student_profile_id", user.id)
      .eq("company_profile_id", companyProfileId);

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to remove subscription.");
    }

    return NextResponse.json({ success: true });
  });
}
