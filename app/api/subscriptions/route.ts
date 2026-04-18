import { NextRequest, NextResponse } from "next/server";
import { requireVerifiedStudent } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { parseJsonBody, subscriptionsCreateBodySchema } from "@/lib/api/validate";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireVerifiedStudent(request);
    const payload = await parseJsonBody(request, subscriptionsCreateBodySchema);

    const { data, error } = await supabase
      .from("company_subscriptions")
      .insert({
        student_profile_id: user.id,
        company_profile_id: payload.company_profile_id,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError(409, "CONFLICT", "Already subscribed to this company.");
      }

      throw new ApiError(500, "DB_ERROR", "Failed to create subscription.");
    }

    return NextResponse.json({ subscription: data }, { status: 201 });
  });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireVerifiedStudent(request);

    const { data, error } = await supabase
      .from("company_subscriptions")
      .select(
        "id, created_at, company_profile_id, company_profiles(id, company_name, logo_url, industry, location, approval_status)"
      )
      .eq("student_profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load subscriptions.");
    }

    return NextResponse.json({ subscriptions: data || [] });
  });
}
