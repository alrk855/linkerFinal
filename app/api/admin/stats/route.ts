import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/auth-guard";
import { createServiceClient } from "@/lib/supabase/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request);

    const supabase = createServiceClient();

    const [
      { count: totalStudents, error: totalStudentsError },
      { count: verifiedStudents, error: verifiedStudentsError },
      { count: companiesPending, error: companiesPendingError },
      { count: companiesApproved, error: companiesApprovedError },
      { count: companiesRejected, error: companiesRejectedError },
      { count: activeListings, error: activeListingsError },
      { count: acknowledgmentsSent, error: acknowledgmentsError },
      { count: applicationsSubmitted, error: applicationsError },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .eq("role", "student"),
      supabase
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .eq("role", "student")
        .eq("is_verified_student", true),
      supabase
        .from("company_profiles")
        .select("id", { head: true, count: "exact" })
        .eq("approval_status", "pending"),
      supabase
        .from("company_profiles")
        .select("id", { head: true, count: "exact" })
        .eq("approval_status", "approved"),
      supabase
        .from("company_profiles")
        .select("id", { head: true, count: "exact" })
        .eq("approval_status", "rejected"),
      supabase
        .from("listings")
        .select("id", { head: true, count: "exact" })
        .eq("is_active", true)
        .eq("is_deleted", false),
      supabase.from("acknowledgments").select("id", { head: true, count: "exact" }),
      supabase.from("applications").select("id", { head: true, count: "exact" }),
    ]);

    if (
      totalStudentsError ||
      verifiedStudentsError ||
      companiesPendingError ||
      companiesApprovedError ||
      companiesRejectedError ||
      activeListingsError ||
      acknowledgmentsError ||
      applicationsError
    ) {
      throw new ApiError(500, "DB_ERROR", "Failed to load admin stats.");
    }

    return NextResponse.json({
      stats: {
        total_students_registered: totalStudents || 0,
        total_verified_students: verifiedStudents || 0,
        total_companies: {
          pending: companiesPending || 0,
          approved: companiesApproved || 0,
          rejected: companiesRejected || 0,
        },
        total_listings_active: activeListings || 0,
        total_acknowledgments_sent: acknowledgmentsSent || 0,
        total_applications_submitted: applicationsSubmitted || 0,
      },
    });
  });
}
