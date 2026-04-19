import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import { createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request);

    const supabase = createServiceClient();
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // "pending" | "approved" | "rejected" | "all"

    let query = supabase
      .from("company_profiles")
      .select("*, profiles!company_profiles_profile_id_fkey(id, username, full_name, email, avatar_url, created_at)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status === "pending") {
      query = query.eq("approval_status", "pending");
    } else if (status === "approved") {
      query = query.eq("approval_status", "approved");
    } else if (status === "rejected") {
      query = query.eq("approval_status", "rejected");
    }

    const { data, error } = await query;
    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load companies.");
    }

    return NextResponse.json({ companies: data || [] });
  });
}
