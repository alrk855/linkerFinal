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
    const status = url.searchParams.get("status"); // "pending" | "verified" | "all"

    let query = supabase
      .from("profiles")
      .select("id, username, full_name, email, avatar_url, is_verified_student, created_at, student_profiles(faculty, year_of_study, degree_type)")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status === "pending") {
      query = query.eq("is_verified_student", false);
    } else if (status === "verified") {
      query = query.eq("is_verified_student", true);
    }

    const { data, error } = await query;
    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load students.");
    }

    return NextResponse.json({ students: data || [] });
  });
}
