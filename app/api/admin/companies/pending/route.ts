import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import { createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("company_profiles")
      .select(
        "*, profiles!company_profiles_profile_id_fkey(id, username, full_name, avatar_url, website_url)"
      )
      .eq("approval_status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load pending companies.");
    }

    return NextResponse.json({ companies: data || [] });
  });
}
